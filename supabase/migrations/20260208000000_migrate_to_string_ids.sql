-- Migration: migrate_to_string_level_ids
-- Description: Changes level identification from integer ID to string slug.
--              Backfills existing data and updates all dependent functions/views.

-- 1. Add new column
ALTER TABLE level_completions ADD COLUMN level_id text;

-- 2. Backfill data
UPDATE level_completions SET level_id = CASE
    WHEN level = 1 THEN 'delete-words'
    WHEN level = 2 THEN 'flip-ternary'
    WHEN level = 3 THEN 'remove-hiccups'
    WHEN level = 4 THEN 'extract-domain'
    WHEN level = 5 THEN 'quote-wrapping'
    WHEN level = 6 THEN 'function-parameters'
    WHEN level = 7 THEN 'tag-switcheroo'
    WHEN level = 8 THEN 'argument-swap'
    WHEN level = 9 THEN 'typos-galore'
    WHEN level = 10 THEN 'snake-to-kebab'
    WHEN level = 11 THEN 'unwrap-block'
    WHEN level = 12 THEN 'semicolon-appender'
    WHEN level = 13 THEN 'markdown-header'
    WHEN level = 14 THEN 'object-property'
    WHEN level = 15 THEN 'inner-html-clear'
    WHEN level = 16 THEN 'clean-up-list'
    WHEN level = 17 THEN 'comment-block'
    WHEN level = 18 THEN 'jsonify'
    WHEN level = 19 THEN 'snake-to-camel'
    ELSE 'unknown-' || level::text
END;

-- 3. Enforce NOT NULL
ALTER TABLE level_completions ALTER COLUMN level_id SET NOT NULL;

-- 4. Recreate view `view_user_level_bests` using new column
DROP VIEW IF EXISTS view_user_level_bests CASCADE;

CREATE VIEW view_user_level_bests AS
SELECT 
    user_id,
    level_id,
    min(keystrokes_count) as best_score
FROM level_completions
GROUP BY user_id, level_id;

-- 5. Update `get_level_score_distribution` RPC
CREATE OR REPLACE FUNCTION get_level_score_distribution(p_level_id text)
RETURNS TABLE (
  score int,
  count bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    best_score as score,
    count(*) as count
  FROM view_user_level_bests
  WHERE level_id = p_level_id
  GROUP BY best_score
  ORDER BY best_score ASC;
$$;

-- 6. Update `submit_level_completion` RPC
CREATE OR REPLACE FUNCTION public.submit_level_completion(
    p_user_id uuid, 
    p_level_id text, 
    p_keystrokes_count integer, 
    p_keystrokes text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_completion_id UUID;
BEGIN
  -- Ensure user exists (upsert)
  INSERT INTO users (id, last_seen)
  VALUES (p_user_id, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET last_seen = NOW();
  
  -- Insert completion
  INSERT INTO level_completions (user_id, level_id, keystrokes_count, keystrokes)
  VALUES (p_user_id, p_level_id, p_keystrokes_count, p_keystrokes)
  RETURNING id INTO v_completion_id;
  
  RETURN v_completion_id;
END;
$function$;

-- 7. Update `get_player_dashboard` RPC
-- Note: We now take distinct level_ids from the table instead of generating a series 1..19
-- Ideally, we'd pass the known level IDs from the client or have a levels table, 
-- but for now we will query the distinct levels found in the data or just return what we have.
-- HOWEVER, to preserve the "all levels" structure, let's accept an array of level IDs from the client.
-- This makes the dashboard resilient to whatever the client thinks the levels are.

CREATE OR REPLACE FUNCTION public.get_player_dashboard(
    p_user_id uuid,
    p_level_ids text[]
)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    result json;
BEGIN
    SELECT json_object_agg(
        lvl.lid,
        json_build_object(
            'user', json_build_object(
                'best', u_best.score,
                'percentile', u_stats.percentile
            ),
            'global', json_build_object(
                'best', g_stats.best_score,
                'average', g_avgs.avg_of_bests,
                'completions', COALESCE(g_stats.total_completions, 0),
                'best_score_log', (
                    SELECT keystrokes 
                    FROM level_completions lc 
                    WHERE lc.level_id = lvl.lid 
                    AND lc.keystrokes_count = g_stats.best_score 
                    ORDER BY lc.completed_at ASC 
                    LIMIT 1
                )
            )
        )
    ) INTO result
    FROM (SELECT unnest(p_level_ids) as lid) lvl
    LEFT JOIN (
        SELECT 
            level_id,
            MIN(keystrokes_count) as best_score,
            COUNT(*) as total_completions
        FROM level_completions
        GROUP BY level_id
    ) g_stats ON lvl.lid = g_stats.level_id
    LEFT JOIN (
        SELECT 
            level_id,
            ROUND(AVG(best_score), 1) as avg_of_bests
        FROM view_user_level_bests
        GROUP BY level_id
    ) g_avgs ON lvl.lid = g_avgs.level_id
    LEFT JOIN (
        SELECT 
            level_id, 
            MIN(keystrokes_count) as score
        FROM level_completions 
        WHERE user_id = p_user_id
        GROUP BY level_id
    ) u_best ON lvl.lid = u_best.level_id
    LEFT JOIN (
        SELECT 
            lc.level_id,
            lc.user_id,
            PERCENT_RANK() OVER (PARTITION BY lc.level_id ORDER BY min(lc.keystrokes_count)) * 100 as percentile
        FROM level_completions lc
        GROUP BY lc.level_id, lc.user_id
    ) u_stats ON lvl.lid = u_stats.level_id AND u_stats.user_id = p_user_id;

    RETURN result;
END;
$function$;
