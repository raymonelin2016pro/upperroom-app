-- Create game_scores table
create table if not exists public.game_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  game_id text not null,
  score integer not null, -- For Speed King, this is reaction time in ms (lower is better)
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.game_scores enable row level security;

-- Policies
create policy "Game scores are viewable by everyone"
  on public.game_scores for select
  using ( true );

create policy "Users can insert their own scores"
  on public.game_scores for insert
  with check ( auth.uid() = user_id );

-- Index for performance
create index game_scores_game_id_created_at_idx on public.game_scores (game_id, created_at);
create index game_scores_user_id_idx on public.game_scores (user_id);

-- Create a view for Weekly Leaderboard (Speed King specific for now, or generic if possible)
-- Since different games might have different "best" criteria (min vs max), 
-- let's make a specific view or just use a query. 
-- A view is cleaner for the client. Let's make one for Speed King.

create or replace view public.speed_king_weekly_leaderboard as
select
  s.user_id,
  p.username,
  p.avatar_url,
  min(s.score) as best_score,
  rank() over (order by min(s.score) asc) as rank
from
  public.game_scores s
join
  public.profiles p on s.user_id = p.id
where
  s.game_id = 'speed_king'
  and s.created_at >= date_trunc('week', now())
group by
  s.user_id, p.username, p.avatar_url;
