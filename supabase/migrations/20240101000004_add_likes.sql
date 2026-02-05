-- Create likes table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  post_id uuid references public.posts not null,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Enable RLS
alter table public.likes enable row level security;

-- Likes policies
create policy "Likes are viewable by everyone"
  on likes for select
  using ( true );

create policy "Authenticated users can toggle likes"
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can remove their own likes"
  on likes for delete
  using ( auth.uid() = user_id );
