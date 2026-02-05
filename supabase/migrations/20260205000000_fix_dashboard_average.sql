CREATE OR REPLACE FUNCTION public.get_player_dashboard(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    result json;
BEGIN
    SELECT json_object_agg(
        lvl.lvl_id,
        json_build_object(
            'user', json_build_object(
                'best', u_best.score,
                'percentile', u_stats.percentile
            ),
            'global', json_build_object(
                'best', g_stats.best_score,
                'average', g_avgs.avg_of_bests,
                'completions', g_stats.total_completions,
                'best_score_log', (
                    SELECT keystrokes 
                    FROM level_completions lc 
                    WHERE lc.level = lvl.lvl_id 
                    AND lc.keystrokes_count = g_stats.best_score 
                    ORDER BY lc.completed_at ASC 
                    LIMIT 1
                )
            )
        )
    ) INTO result
    FROM (SELECT generate_series(1, 19) as lvl_id) lvl
    LEFT JOIN (
        SELECT 
            level,
            MIN(keystrokes_count) as best_score,
            COUNT(*) as total_completions
        FROM level_completions
        GROUP BY level
    ) g_stats ON lvl.lvl_id = g_stats.level
    LEFT JOIN (
        SELECT 
            level,
            ROUND(AVG(best_score), 1) as avg_of_bests
        FROM view_user_level_bests
        GROUP BY level
    ) g_avgs ON lvl.lvl_id = g_avgs.level
    LEFT JOIN (
        SELECT 
            level, 
            MIN(keystrokes_count) as score
        FROM level_completions 
        WHERE user_id = p_user_id
        GROUP BY level
    ) u_best ON lvl.lvl_id = u_best.level
    LEFT JOIN (
        SELECT 
            lc.level,
            lc.user_id,
            PERCENT_RANK() OVER (PARTITION BY lc.level ORDER BY min(lc.keystrokes_count)) * 100 as percentile
        FROM level_completions lc
        GROUP BY lc.level, lc.user_id
    ) u_stats ON lvl.lvl_id = u_stats.level AND u_stats.user_id = p_user_id;
    RETURN result;
END;
$function$;
