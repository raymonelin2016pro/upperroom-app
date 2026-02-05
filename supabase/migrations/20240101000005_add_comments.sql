-- Create comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  post_id uuid references public.posts not null,
  text text not null,
  created_at timestamp with time zone default now()
);

-- Add explicit relationship to profiles for PostgREST
alter table public.comments
add constraint comments_user_id_profiles_fkey
foreign key (user_id)
references public.profiles(id);

-- Enable RLS
alter table public.comments enable row level security;

-- Comments policies
create policy "Comments are viewable by everyone"
  on comments for select
  using ( true );

create policy "Authenticated users can create comments"
  on comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comments"
  on comments for delete
  using ( auth.uid() = user_id );
