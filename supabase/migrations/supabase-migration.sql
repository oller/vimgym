-- VimGym Supabase Database Migration - WITH ATOMIC FUNCTION
-- Run this entire script in Supabase Dashboard → SQL Editor

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Level Completions Table
-- ============================================
CREATE TABLE IF NOT EXISTS level_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 19),
  keystrokes_count INTEGER NOT NULL CHECK (keystrokes_count >= 1),
  keystrokes TEXT[] NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Performance Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_level_completions_user_level
  ON level_completions(user_id, level);

CREATE INDEX IF NOT EXISTS idx_level_completions_level_time
  ON level_completions(level, completed_at DESC);

-- ============================================
-- 4. Materialized View for Statistics
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS level_stats AS
SELECT
  level,
  COUNT(*) as total_completions,
  ROUND(AVG(keystrokes_count)::numeric, 2) as avg_keystrokes,
  MIN(keystrokes_count) as best_score
FROM level_completions
GROUP BY level;

CREATE UNIQUE INDEX IF NOT EXISTS idx_level_stats_level
  ON level_stats(level);

-- ============================================
-- 5. Database Function - Submit Completion (ATOMIC)
-- ============================================
-- This function ensures user exists and inserts completion in ONE request
CREATE OR REPLACE FUNCTION submit_level_completion(
  p_user_id UUID,
  p_level INTEGER,
  p_keystrokes_count INTEGER,
  p_keystrokes TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completion_id UUID;
BEGIN
  -- Ensure user exists (upsert)
  INSERT INTO users (id, last_seen)
  VALUES (p_user_id, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET last_seen = NOW();
  
  -- Insert completion
  INSERT INTO level_completions (user_id, level, keystrokes_count, keystrokes)
  VALUES (p_user_id, p_level, p_keystrokes_count, p_keystrokes)
  RETURNING id INTO v_completion_id;
  
  RETURN v_completion_id;
END;
$$;

-- ============================================
-- 6. Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous user creation" ON users;
DROP POLICY IF EXISTS "Allow anonymous user upserts" ON users;
DROP POLICY IF EXISTS "Allow all user operations" ON users;
DROP POLICY IF EXISTS "Allow anonymous level completions" ON level_completions;
DROP POLICY IF EXISTS "Allow public completions reads" ON level_completions;

-- USERS: Allow anonymous reads (needed for foreign key checks)
CREATE POLICY "Allow all user operations"
  ON users
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- LEVEL_COMPLETIONS: Allow reads
CREATE POLICY "Allow public completions reads"
  ON level_completions
  FOR SELECT
  TO anon
  USING (true);

-- Note: We don't need INSERT policy on level_completions because 
-- the function uses SECURITY DEFINER (runs with owner permissions)

-- ============================================
-- 7. Grant Execute Permission to Function
-- ============================================
GRANT EXECUTE ON FUNCTION submit_level_completion(UUID, INTEGER, INTEGER, TEXT[]) TO anon;

-- ============================================
-- 8. Verification
-- ============================================
-- After running this script, verify:
-- 1. Database → Tables: users, level_completions, level_stats
-- 2. Database → Functions: submit_level_completion
-- 3. Test the function:
--    SELECT submit_level_completion(
--      '123e4567-e89b-12d3-a456-426614174000'::uuid,
--      1,
--      6,
--      ARRAY['f', 's', 'l', 'd', 't', '.']
--    );

-- ============================================
-- 9. Refreshing Materialized View
-- ============================================
-- Run periodically to update stats:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY level_stats;
