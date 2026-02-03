create or replace function get_level_score_distribution(p_level_id int)
returns table (
  score int,
  count bigint
) 
language sql
security definer
as $$
  select 
    best_score as score,
    count(*) as count
  from view_user_level_bests
  where level = p_level_id
  group by best_score
  order by best_score asc;
$$;
