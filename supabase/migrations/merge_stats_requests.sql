CREATE OR REPLACE FUNCTION get_player_dashboard(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH user_bests AS (
  SELECT level, best_score
  FROM view_user_level_bests
  WHERE user_id = p_user_id
),
percentile_data AS (
  SELECT
    ub.level,
    ub.best_score,
    (SELECT COUNT(*) FROM view_user_level_bests WHERE level = ub.level AND best_score > ub.best_score) as worse_count,
    (SELECT COUNT(*) FROM view_user_level_bests WHERE level = ub.level) as total_participants
  FROM user_bests ub
)
SELECT jsonb_object_agg(
  COALESCE(ls.level, pd.level)::text,
  jsonb_build_object(
    'user', jsonb_build_object(
      'best', pd.best_score,
      'percentile', CASE
        WHEN pd.best_score IS NULL THEN NULL
        WHEN pd.total_participants <= 1 THEN 100
        ELSE ROUND((pd.worse_count::numeric / pd.total_participants::numeric) * 100, 1)
      END
    ),
    'global', jsonb_build_object(
      'best', ls.best_score,
      'average', ls.avg_keystrokes,
      'completions', COALESCE(ls.total_completions, 0)
    )
  )
)
FROM level_stats ls
FULL OUTER JOIN percentile_data pd ON ls.level = pd.level;
$$;
