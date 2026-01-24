-- Run this in your Supabase SQL Editor to create the optimization function

create or replace function get_user_best_scores(p_user_id uuid)
returns table (level int, best_score int)
language sql
security definer
as $$
  select level, min(keystrokes_count)::int as best_score
  from level_completions
  where user_id = p_user_id
  group by level
  order by level;
$$;
