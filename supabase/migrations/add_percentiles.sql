-- 1. Create a view to easily query the best score for each user on each level
-- This simplifies the percentile calculation logic
CREATE OR REPLACE VIEW view_user_level_bests AS
SELECT user_id, level, MIN(keystrokes_count) as best_score
FROM level_completions
GROUP BY user_id, level;

-- 2. Update get_user_best_scores to return score AND percentile
-- Dropping first to allow return type change
DROP FUNCTION IF EXISTS get_user_best_scores(uuid);

CREATE OR REPLACE FUNCTION get_user_best_scores(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH user_bests AS (
  -- Get this user's best scores
  SELECT level, best_score
  FROM view_user_level_bests
  WHERE user_id = p_user_id
),
level_stats AS (
  -- Calculate percentiles for each level the user has played
  SELECT
    ub.level,
    ub.best_score,
    -- Count users strictly worse (higher score) than this user
    (SELECT COUNT(*) FROM view_user_level_bests WHERE level = ub.level AND best_score > ub.best_score) as worse_count,
    -- Count total users on this level
    (SELECT COUNT(*) FROM view_user_level_bests WHERE level = ub.level) as total_count
  FROM user_bests ub
)
SELECT jsonb_object_agg(
  level::text,
  jsonb_build_object(
    'score', best_score,
    'percentile', CASE
      WHEN total_count <= 1 THEN 100 -- If you're the only one, you're the best (100th percentile)
      ELSE ROUND((worse_count::numeric / total_count::numeric) * 100, 1)
    END
  )
)
FROM level_stats;
$$;
