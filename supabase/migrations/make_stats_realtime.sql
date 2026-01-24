-- Drop the materialized view and its index (cascade should handle dependencies if careful, but explicit is safer)
-- We might need to drop dependent objects first?
-- get_player_dashboard depends on level_stats.
-- So we use CASCADE to drop dependencies and then recreate them IF needed,
-- BUT get_player_dashboard is just text-based dependency usually unless schema bound.
-- Let's try DROP ... CASCADE and then we might need to recreate get_player_dashboard?
-- Actually, replacing a view with a view of the same name might break the function if it hard-compiled the OID.
-- Safer path: DROP FUNCTION get_player_dashboard; DROP VIEW level_stats; CREATE VIEW...; RECREATE FUNCTION...

-- However, in Postgres, if we just DROP MATERIALIZED VIEW level_stats CASCADE; it will drop the function too.
-- Let's allow CASCADE to clean up, and then recreate the View and the Function.

BEGIN;

DROP MATERIALIZED VIEW IF EXISTS level_stats CASCADE;

-- Recreate as Standard View (Real-time)
CREATE OR REPLACE VIEW level_stats AS
SELECT
  level,
  COUNT(*) as total_completions,
  ROUND(AVG(keystrokes_count)::numeric, 2) as avg_keystrokes,
  MIN(keystrokes_count) as best_score
FROM level_completions
GROUP BY level;

-- Recreate the dependent function (get_player_dashboard)
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

-- Recreate get_level_stats function which also likely depended on it?
-- Checking supabase-migration.sql, there was a get_level_stats function.
-- Let's recreate it just in case, though we aren't using it anymore.
CREATE OR REPLACE FUNCTION get_level_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT jsonb_object_agg(
  level::text,
  jsonb_build_object(
    'totalCompletions', total_completions,
    'avgKeystrokes', avg_keystrokes,
    'bestScore', best_score
  )
)
FROM level_stats;
$$;

COMMIT;
