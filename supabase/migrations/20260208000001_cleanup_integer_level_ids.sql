-- Migration: cleanup_integer_level_ids
-- Description: Drops old integer-based functions, the legacy 'level' column, and updates dependent views.

-- 1. Drop old functions that depend on integer 'level'
DROP FUNCTION IF EXISTS get_level_score_distribution(integer);
DROP FUNCTION IF EXISTS get_player_dashboard(uuid);
DROP FUNCTION IF EXISTS submit_level_completion(uuid, integer, integer, text[]);

-- 2. Drop the old view that depends on 'level'
DROP VIEW IF EXISTS level_stats;

-- 3. Drop legacy column
ALTER TABLE level_completions DROP COLUMN IF EXISTS level;

-- 4. Recreate 'level_stats' using 'level_id'
CREATE OR REPLACE VIEW level_stats AS
 SELECT level_id,
    count(*) AS total_completions,
    round(avg(keystrokes_count), 2) AS avg_keystrokes,
    min(keystrokes_count) AS best_score
   FROM level_completions
  GROUP BY level_id;
