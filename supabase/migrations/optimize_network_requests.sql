-- Function to get all level stats as a JSON map { "level_id": { ...stats } }
-- Renamed from get_level_stats_map to get_level_stats
drop function if exists get_level_stats_map();

create or replace function get_level_stats()
returns jsonb
language sql
security definer
as $$
  select jsonb_object_agg(
    level::text,
    jsonb_build_object(
      'level', level,
      'totalCompletions', total_completions,
      'avgKeystrokes', avg_keystrokes,
      'bestScore', best_score
    )
  )
  from level_stats;
$$;

-- Updated function to get user best scores as a JSON map { "level_id": score }
-- Must drop first because return type changed from TABLE to JSONB
drop function if exists get_user_best_scores(uuid);

create or replace function get_user_best_scores(p_user_id uuid)
returns jsonb
language sql
security definer
as $$
  select jsonb_object_agg(
    level::text,
    best_score
  )
  from (
    select level, min(keystrokes_count)::int as best_score
    from level_completions
    where user_id = p_user_id
    group by level
  ) as user_scores;
$$;
