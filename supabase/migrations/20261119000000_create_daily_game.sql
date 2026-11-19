-- Vimdle (Daily Vim Golf) schema, real-time views, RPCs, and 21-day starter seed
-- Follows VimGym's RPC-first Supabase convention:
--   * Direct anon SELECT on daily_puzzles is denied via RLS so future puzzles
--     and par_solution never leak.
--   * All reads and writes go through SECURITY DEFINER RPC functions.

-- ============================================================================
-- 1. Tables
-- ============================================================================

create table if not exists public.daily_puzzles (
  id uuid primary key default gen_random_uuid(),
  puzzle_number integer not null unique,
  puzzle_date date not null unique,
  title text not null,
  description text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  language text not null check (language in ('html', 'javascript', 'markdown', 'json')),
  start_text text not null,
  target_text text not null,
  start_cursor_line integer not null default 0 check (start_cursor_line >= 0),
  start_cursor_ch integer not null default 0 check (start_cursor_ch >= 0),
  par integer not null check (par > 0),
  min_keystrokes integer not null check (min_keystrokes > 0 and min_keystrokes <= par),
  par_solution text[] not null check (coalesce(array_length(par_solution, 1), 0) = par),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  puzzle_id uuid not null references public.daily_puzzles(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  attempts_used integer not null default 0 check (attempts_used between 0 and 5),
  best_score integer check (best_score is null or best_score > 0),
  best_keystrokes text[],
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, puzzle_id)
);

create index if not exists idx_daily_runs_puzzle_best
  on public.daily_runs (puzzle_id, best_score)
  where best_score is not null;

create index if not exists idx_daily_runs_user_status
  on public.daily_runs (user_id, status);

create table if not exists public.daily_attempts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.daily_runs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  puzzle_id uuid not null references public.daily_puzzles(id) on delete cascade,
  attempt_number integer not null check (attempt_number between 1 and 5),
  outcome text not null check (outcome in ('solved', 'abandoned')),
  keystrokes_count integer not null check (keystrokes_count >= 0),
  keystrokes text[] not null,
  created_at timestamptz not null default now(),
  unique (run_id, attempt_number)
);

-- Enable RLS and block direct table access from anon/authenticated roles
alter table public.daily_puzzles enable row level security;
alter table public.daily_runs enable row level security;
alter table public.daily_attempts enable row level security;

-- ============================================================================
-- 2. Real-Time Views
-- ============================================================================

create or replace view public.daily_puzzle_stats as
select
  r.puzzle_id,
  count(*)::int as total_players,
  count(*) filter (where r.best_score is not null)::int as solved_players,
  avg(r.best_score)::double precision as avg_best_score,
  min(r.best_score)::int as global_best_score,
  (
    select r2.best_keystrokes
    from public.daily_runs r2
    where r2.puzzle_id = r.puzzle_id
      and r2.best_score is not null
    order by r2.best_score asc, r2.finished_at asc nulls last, r2.created_at asc
    limit 1
  ) as global_best_keystrokes
from public.daily_runs r
group by r.puzzle_id;

create or replace view public.daily_score_distribution as
select
  r.puzzle_id,
  r.best_score as score,
  count(*)::int as count
from public.daily_runs r
where r.best_score is not null
group by r.puzzle_id, r.best_score;

-- ============================================================================
-- 3. Internal Helper & Public RPC Functions
-- ============================================================================

create or replace function public._build_daily_state(
  p_user_id uuid,
  p_puzzle public.daily_puzzles
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run public.daily_runs%rowtype;
  v_has_run boolean := false;
  v_is_finished boolean := false;
  v_attempts jsonb;
  v_user_stats jsonb;
  v_global_stats jsonb := null;
  v_distribution jsonb := '[]'::jsonb;
  v_percentile double precision := null;
  v_today_utc date := (now() at time zone 'utc')::date;
begin
  select *
  into v_run
  from public.daily_runs
  where user_id = p_user_id
    and puzzle_id = p_puzzle.id;

  v_has_run := found;
  v_is_finished := v_has_run and v_run.status in ('completed', 'failed');

  if v_has_run then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'attempt_number', a.attempt_number,
          'outcome', a.outcome,
          'keystrokes_count', a.keystrokes_count,
          'keystrokes', to_jsonb(a.keystrokes)
        )
        order by a.attempt_number asc
      ),
      '[]'::jsonb
    )
    into v_attempts
    from public.daily_attempts a
    where a.run_id = v_run.id;
  else
    v_attempts := '[]'::jsonb;
  end if;

  -- Compute user aggregate stats & streaks across UTC puzzle dates
  with finished_runs as (
    select
      p.puzzle_date,
      r.status
    from public.daily_runs r
    join public.daily_puzzles p on p.id = r.puzzle_id
    where r.user_id = p_user_id
      and r.status in ('completed', 'failed')
  ),
  won_dates as (
    select distinct puzzle_date
    from finished_runs
    where status = 'completed'
  ),
  grouped_streaks as (
    select
      puzzle_date,
      puzzle_date - (row_number() over (order by puzzle_date))::int as grp
    from won_dates
  ),
  streak_runs as (
    select
      min(puzzle_date) as start_date,
      max(puzzle_date) as end_date,
      count(*)::int as len
    from grouped_streaks
    group by grp
  )
  select jsonb_build_object(
    'current_streak', coalesce(
      (
        select s.len
        from streak_runs s
        where s.end_date in (v_today_utc, v_today_utc - 1)
        order by s.end_date desc
        limit 1
      ),
      0
    ),
    'max_streak', coalesce((select max(s.len) from streak_runs s), 0),
    'games_played', (select count(*)::int from finished_runs),
    'games_won', (select count(*)::int from won_dates)
  )
  into v_user_stats;

  -- Only unlock global distribution & solutions once the user's run is finished
  if v_is_finished then
    if v_run.best_score is not null then
      select
        case
          when count(*) = 0 then 100
          else round(
            (count(*) filter (where r.best_score >= v_run.best_score))::numeric
            * 100.0
            / count(*)::numeric,
            1
          )::double precision
        end
      into v_percentile
      from public.daily_runs r
      where r.puzzle_id = p_puzzle.id
        and r.best_score is not null;
    end if;

    select jsonb_build_object(
      'total_players', coalesce(s.total_players, 0),
      'solved_players', coalesce(s.solved_players, 0),
      'avg_best_score', s.avg_best_score,
      'global_best_score', s.global_best_score,
      'global_best_keystrokes', to_jsonb(s.global_best_keystrokes),
      'user_percentile', v_percentile
    )
    into v_global_stats
    from public.daily_puzzle_stats s
    where s.puzzle_id = p_puzzle.id;

    if v_global_stats is null then
      v_global_stats := jsonb_build_object(
        'total_players', 0,
        'solved_players', 0,
        'avg_best_score', null,
        'global_best_score', null,
        'global_best_keystrokes', null,
        'user_percentile', null
      );
    end if;

    select coalesce(
      jsonb_agg(
        jsonb_build_object('score', d.score, 'count', d.count)
        order by d.score asc
      ),
      '[]'::jsonb
    )
    into v_distribution
    from public.daily_score_distribution d
    where d.puzzle_id = p_puzzle.id;
  end if;

  return jsonb_build_object(
    'puzzle', jsonb_build_object(
      'id', p_puzzle.id,
      'puzzle_number', p_puzzle.puzzle_number,
      'puzzle_date', to_char(p_puzzle.puzzle_date, 'YYYY-MM-DD'),
      'title', p_puzzle.title,
      'description', p_puzzle.description,
      'difficulty', p_puzzle.difficulty,
      'language', p_puzzle.language,
      'start_text', p_puzzle.start_text,
      'target_text', p_puzzle.target_text,
      'start_cursor_line', p_puzzle.start_cursor_line,
      'start_cursor_ch', p_puzzle.start_cursor_ch,
      'par', p_puzzle.par,
      'min_keystrokes', p_puzzle.min_keystrokes,
      'par_solution', case when v_is_finished then to_jsonb(p_puzzle.par_solution) else null end
    ),
    'run', jsonb_build_object(
      'status', case when v_has_run then v_run.status else 'in_progress' end,
      'attempts_used', case when v_has_run then v_run.attempts_used else 0 end,
      'best_score', case when v_has_run then v_run.best_score else null end,
      'best_keystrokes', case when v_has_run then to_jsonb(v_run.best_keystrokes) else null end,
      'finished_at', case when v_has_run and v_run.finished_at is not null then to_char(v_run.finished_at at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') else null end
    ),
    'attempts', v_attempts,
    'user_stats', v_user_stats,
    'global_stats', v_global_stats,
    'distribution', v_distribution
  );
end;
$$;

create or replace function public.get_daily_state(
  p_user_id uuid,
  p_date date default (now() at time zone 'utc')::date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today_utc date := (now() at time zone 'utc')::date;
  v_target_date date := coalesce(p_date, v_today_utc);
  v_puzzle public.daily_puzzles%rowtype;
begin
  if v_target_date > v_today_utc then
    raise exception 'Future puzzles are not available';
  end if;

  select *
  into v_puzzle
  from public.daily_puzzles
  where puzzle_date = v_target_date;

  if not found then
    -- Fallback to latest scheduled puzzle on or before target date so the game stays live
    select *
    into v_puzzle
    from public.daily_puzzles
    where puzzle_date <= v_target_date
    order by puzzle_date desc
    limit 1;
  end if;

  if not found then
    raise exception 'No daily puzzle scheduled for %', v_target_date;
  end if;

  return public._build_daily_state(p_user_id, v_puzzle);
end;
$$;

create or replace function public.submit_daily_attempt(
  p_user_id uuid,
  p_puzzle_id uuid,
  p_outcome text,
  p_keystrokes text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today_utc date := (now() at time zone 'utc')::date;
  v_puzzle public.daily_puzzles%rowtype;
  v_run public.daily_runs%rowtype;
  v_count integer := coalesce(array_length(p_keystrokes, 1), 0);
  v_next_attempt integer;
  v_new_best_score integer;
  v_new_best_keystrokes text[];
  v_new_status text;
  v_finished_at timestamptz;
begin
  if p_outcome not in ('solved', 'abandoned') then
    raise exception 'Invalid outcome: %', p_outcome;
  end if;

  select *
  into v_puzzle
  from public.daily_puzzles
  where id = p_puzzle_id;

  if not found then
    raise exception 'Daily puzzle not found';
  end if;

  if v_puzzle.puzzle_date > v_today_utc then
    raise exception 'Cannot submit for a future puzzle';
  end if;

  if p_outcome = 'solved' and v_count < v_puzzle.min_keystrokes then
    raise exception 'Submitted keystroke count (%) below puzzle minimum (%)', v_count, v_puzzle.min_keystrokes;
  end if;

  -- Ensure anonymous user row exists
  insert into public.users (id, last_seen)
  values (p_user_id, now())
  on conflict (id) do update set last_seen = now();

  -- Ensure run row exists and lock it for atomic update
  insert into public.daily_runs (user_id, puzzle_id)
  values (p_user_id, p_puzzle_id)
  on conflict (user_id, puzzle_id) do nothing;

  select *
  into v_run
  from public.daily_runs
  where user_id = p_user_id
    and puzzle_id = p_puzzle_id
  for update;

  if v_run.status <> 'in_progress' or v_run.attempts_used >= 5 then
    return public._build_daily_state(p_user_id, v_puzzle);
  end if;

  v_next_attempt := v_run.attempts_used + 1;

  insert into public.daily_attempts (
    run_id,
    user_id,
    puzzle_id,
    attempt_number,
    outcome,
    keystrokes_count,
    keystrokes
  )
  values (
    v_run.id,
    p_user_id,
    p_puzzle_id,
    v_next_attempt,
    p_outcome,
    v_count,
    coalesce(p_keystrokes, array[]::text[])
  );

  v_new_best_score := v_run.best_score;
  v_new_best_keystrokes := v_run.best_keystrokes;

  if p_outcome = 'solved' and (v_new_best_score is null or v_count < v_new_best_score) then
    v_new_best_score := v_count;
    v_new_best_keystrokes := p_keystrokes;
  end if;

  if v_next_attempt >= 5 then
    v_new_status := case when v_new_best_score is not null then 'completed' else 'failed' end;
    v_finished_at := now();
  else
    v_new_status := 'in_progress';
    v_finished_at := null;
  end if;

  update public.daily_runs
  set
    attempts_used = v_next_attempt,
    best_score = v_new_best_score,
    best_keystrokes = v_new_best_keystrokes,
    status = v_new_status,
    finished_at = v_finished_at
  where id = v_run.id;

  return public._build_daily_state(p_user_id, v_puzzle);
end;
$$;

create or replace function public.finish_daily_run(
  p_user_id uuid,
  p_puzzle_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_puzzle public.daily_puzzles%rowtype;
  v_run public.daily_runs%rowtype;
begin
  select *
  into v_puzzle
  from public.daily_puzzles
  where id = p_puzzle_id;

  if not found then
    raise exception 'Daily puzzle not found';
  end if;

  insert into public.users (id, last_seen)
  values (p_user_id, now())
  on conflict (id) do update set last_seen = now();

  insert into public.daily_runs (user_id, puzzle_id)
  values (p_user_id, p_puzzle_id)
  on conflict (user_id, puzzle_id) do nothing;

  select *
  into v_run
  from public.daily_runs
  where user_id = p_user_id
    and puzzle_id = p_puzzle_id
  for update;

  if v_run.status = 'in_progress' then
    update public.daily_runs
    set
      status = case when v_run.best_score is not null then 'completed' else 'failed' end,
      finished_at = now()
    where id = v_run.id;
  end if;

  return public._build_daily_state(p_user_id, v_puzzle);
end;
$$;

revoke all on function public._build_daily_state(uuid, public.daily_puzzles) from public;
grant execute on function public.get_daily_state(uuid, date) to anon, authenticated;
grant execute on function public.submit_daily_attempt(uuid, uuid, text, text[]) to anon, authenticated;
grant execute on function public.finish_daily_run(uuid, uuid) to anon, authenticated;

-- ============================================================================
-- 4. Starter Seed (21 Curated Daily Puzzles starting from CURRENT_DATE UTC)
--    Adjust base_date below if you want to pin launch to a specific calendar date.
-- ============================================================================

with base as (
  select (now() at time zone 'utc')::date as start_date
)
insert into public.daily_puzzles (
  puzzle_number,
  puzzle_date,
  title,
  description,
  difficulty,
  language,
  start_text,
  target_text,
  start_cursor_line,
  start_cursor_ch,
  par,
  min_keystrokes,
  par_solution
)
select
  seed.puzzle_number,
  (select start_date from base) + (seed.puzzle_number - 1),
  seed.title,
  seed.description,
  seed.difficulty,
  seed.language,
  seed.start_text,
  seed.target_text,
  0,
  0,
  array_length(seed.par_solution, 1),
  seed.min_keystrokes,
  seed.par_solution
from (
  values
    (1, 'Debug Cleanup', 'Remove both console.log statements from the function.', 'easy', 'javascript',
      E'function total(items) {\n  console.log("start");\n  const sum = items.reduce((a, b) => a + b, 0);\n  console.log(sum);\n  return sum;\n}',
      E'function total(items) {\n  const sum = items.reduce((a, b) => a + b, 0);\n  return sum;\n}',
      4, array['j','d','d','j','d','d']),
    (2, 'Swap Arguments', 'Swap width and height in the createBox call.', 'medium', 'javascript',
      E'const box = createBox(\n  width, height\n);',
      E'const box = createBox(\n  height, width\n);',
      7, array['j','w','d','w','w','v','e','p','^','P']),
    (3, 'Trailing Commas', 'Add the missing commas to make this valid JSON.', 'easy', 'json',
      E'{\n  "host": "localhost"\n  "port": 5432\n  "ssl": true\n}',
      E'{\n  "host": "localhost",\n  "port": 5432,\n  "ssl": true\n}',
      5, array['j','A',',','<Esc>','j','.']),
    (4, 'Ready State', 'Replace everything inside <main> with the word Ready.', 'easy', 'html',
      E'<section>\n  <main><span>Loading data...</span></main>\n</section>',
      E'<section>\n  <main>Ready</main>\n</section>',
      10, array['j','f','m','c','i','t','R','e','a','d','y','<Esc>']),
    (5, 'Silence Debug Flags', 'Comment out the three debug properties in config.', 'easy', 'javascript',
      E'const config = {\n  debugSql: true,\n  debugAuth: true,\n  debugCache: true,\n  timeoutMs: 5000,\n};',
      E'const config = {\n  // debugSql: true,\n  // debugAuth: true,\n  // debugCache: true,\n  timeoutMs: 5000,\n};',
      4, array['j','V','2','j','g','c']),
    (6, 'Inline Return', 'Remove the temporary result variable and return directly.', 'medium', 'javascript',
      E'function doubleAll(nums) {\n  const result = nums.map((n) => n * 2);\n  return result;\n}',
      E'function doubleAll(nums) {\n  return nums.map((n) => n * 2);\n}',
      11, array['j','^','c','f','=','r','e','t','u','r','n','<Esc>','j','d','d']),
    (7, 'Release Checklist', 'Prefix every line with an unchecked Markdown task ''- [ ] ''.', 'medium', 'markdown',
      E'Write schema\nAdd RPC tests\nBuild modal\nShip release',
      E'- [ ] Write schema\n- [ ] Add RPC tests\n- [ ] Build modal\n- [ ] Ship release',
      9, array['I','-',' ','[',' ',']',' ','<Esc>','j','.','j','.','j','.']),
    (8, 'Mutable State', 'Change every const declaration to let.', 'easy', 'javascript',
      E'const retries = 3;\nconst backoff = 100;\nconst active = true;\nconst status = "idle";',
      E'let retries = 3;\nlet backoff = 100;\nlet active = true;\nlet status = "idle";',
      8, array['c','w','l','e','t','<Esc>','j','0','.','j','0','.','j','0','.']),
    (9, 'Strip Inline Comments', 'Remove all trailing inline comments and their leading space.', 'medium', 'javascript',
      E'const host = "0.0.0.0"; // bind all\nconst port = 8080; // default\nconst mode = "prod"; // strict\nconst logs = false; // quiet',
      E'const host = "0.0.0.0";\nconst port = 8080;\nconst mode = "prod";\nconst logs = false;',
      10, array['f',';','l','D','j','0',';','l','.','j','0',';','l','.','j','0',';','l','.']),
    (10, 'Unquote Numbers', 'Convert all three quoted numeric strings into JSON numbers.', 'hard', 'json',
      E'{\n  "min": "10",\n  "max": "99",\n  "step": "5"\n}',
      E'{\n  "min": 10,\n  "max": 99,\n  "step": 5\n}',
      11, array['j','q','q','3','f','"','x',';','x','j','0','q','2','@','q']),
    (11, 'Single Line Motto', 'Join all four lines into one sentence separated by spaces.', 'easy', 'markdown',
      E'Vim motions\nlet you edit\nat the speed\nof thought.',
      E'Vim motions let you edit at the speed of thought.',
      2, array['J','J','J']),
    (12, 'Quote Colors', 'Wrap each color identifier inside the array in double quotes.', 'hard', 'javascript',
      E'const colors = [\n  red,\n  blue,\n  green\n];',
      E'const colors = [\n  "red",\n  "blue",\n  "green"\n];',
      12, array['j','q','q','^','i','"','<Esc>','e','a','"','<Esc>','j','q','2','@','q']),
    (13, 'Prune Imports', 'Delete the unused lodash and moment imports.', 'easy', 'javascript',
      E'import React from "react";\nimport lodash from "lodash";\nimport { z } from "zod";\nimport moment from "moment";\n\nexport const App = () => null;',
      E'import React from "react";\nimport { z } from "zod";\n\nexport const App = () => null;',
      4, array['j','d','d','j','d','d']),
    (14, 'JSX Class Names', 'Rename every HTML class attribute to className.', 'medium', 'html',
      E'<div class="card">\n  <h2 class="title">Vimdle</h2>\n  <p class="body">Daily golf</p>\n</div>',
      E'<div className="card">\n  <h2 className="title">Vimdle</h2>\n  <p className="body">Daily golf</p>\n</div>',
      11, array['f','=','i','N','a','m','e','<Esc>','j','0',';','.','j','0',';','.']),
    (15, 'Bump Versions', 'Increment every service version number by 1.', 'medium', 'json',
      E'{\n  "api": 1,\n  "web": 4,\n  "cli": 9\n}',
      E'{\n  "api": 2,\n  "web": 5,\n  "cli": 10\n}',
      6, array['j','$','h','r','2','j','$','h','r','5','j','$','s','1','0','<Esc>']),
    (16, 'Add Posts Route', 'Duplicate the "/users" route below it and rename it to "/posts".', 'medium', 'javascript',
      E'const routes = [\n  "/health",\n  "/users",\n];',
      E'const routes = [\n  "/health",\n  "/users",\n  "/posts",\n];',
      11, array['2','j','y','y','p','f','u','c','w','p','o','s','t','s','<Esc>']),
    (17, 'Flush Left', 'Remove the two leading spaces from every line.', 'easy', 'markdown',
      E'  First item\n  Second item\n  Third item\n  Fourth item',
      E'First item\nSecond item\nThird item\nFourth item',
      3, array['4','<','<']),
    (18, 'Empty Callbacks', 'Clear the bodies of both onStart and onStop so they are empty {}.', 'medium', 'javascript',
      E'const hooks = {\n  onStart() { return init(); },\n  onStop() { cleanup(); },\n};',
      E'const hooks = {\n  onStart() {},\n  onStop() {},\n};',
      7, array['j','f','{','d','i','{','j','0',';','.']),
    (19, 'ID First', 'Move "id": 1 to the first property and keep valid JSON commas.', 'hard', 'json',
      E'{\n  "name": "Vimdle",\n  "active": true,\n  "id": 1\n}',
      E'{\n  "id": 1,\n  "name": "Vimdle",\n  "active": true\n}',
      9, array['2','j','$','x','j','A',',','<Esc>','d','d','2','k','P']),
    (20, 'Implicit Arrows', 'Convert all three arrow functions to concise implicit returns.', 'hard', 'javascript',
      E'const math = {\n  inc: (x) => { return x + 1; },\n  dec: (x) => { return x - 1; },\n  dbl: (x) => { return x * 2; },\n};',
      E'const math = {\n  inc: (x) => x + 1,\n  dec: (x) => x - 1,\n  dbl: (x) => x * 2,\n};',
      14, array['j','q','q','f','{','d','2','w','f',';','d','f','}','j','0','q','2','@','q']),
    (21, 'Outline Only', 'Keep only the three Markdown heading lines.', 'hard', 'markdown',
      E'# Setup\nInstall pnpm and run dev.\n# Build\nRun vite build for prod.\n# Test\nRun vitest for checks.',
      E'# Setup\n# Build\n# Test',
      6, array['j','d','d','j','d','d','j','d','d'])
) as seed(
  puzzle_number,
  title,
  description,
  difficulty,
  language,
  start_text,
  target_text,
  min_keystrokes,
  par_solution
)
on conflict (puzzle_number) do nothing;
