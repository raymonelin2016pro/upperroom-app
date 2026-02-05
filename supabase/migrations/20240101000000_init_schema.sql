-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text,
  is_activated boolean default false,
  updated_at timestamp with time zone
);

-- Create invitation_codes table
create table if not exists public.invitation_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  is_used boolean default false,
  used_by uuid references auth.users,
  created_at timestamp with time zone default now()
);

-- Create posts table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  image_url text not null,
  caption text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.invitation_codes enable row level security;
alter table public.posts enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Posts policies
create policy "Posts are viewable by everyone"
  on posts for select
  using ( true );

create policy "Activated users can insert posts"
  on posts for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from profiles
      where id = auth.uid() and is_activated = true
    )
  );

-- Function to handle new user signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to redeem invitation code
create or replace function redeem_invitation(invite_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  invite_record record;
begin
  -- Check if code exists and is unused
  select * into invite_record from invitation_codes
  where code = invite_code and is_used = false;

  if not found then
    return false;
  end if;

  -- Update invitation code
  update invitation_codes
  set is_used = true, used_by = auth.uid()
  where id = invite_record.id;

  -- Activate user
  update profiles
  set is_activated = true
  where id = auth.uid();

  return true;
end;
$$;

-- Seed some invitation codes (ignore conflicts)
insert into invitation_codes (code) values 
('TRAE-2024'), ('HELLO-WORLD'), ('VIP-8888')
on conflict (code) do nothing;

-- Create storage bucket for photos (if not exists logic handled by Supabase API usually, but SQL can try)
insert into storage.buckets (id, name, public) 
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Storage policy (drop first to avoid conflicts if rerunning)
drop policy if exists "Anyone can view photos" on storage.objects;
create policy "Anyone can view photos"
  on storage.objects for select
  using ( bucket_id = 'photos' );

drop policy if exists "Activated users can upload photos" on storage.objects;
create policy "Activated users can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'photos' and
    auth.uid() = owner and
    exists (
      select 1 from profiles
      where id = auth.uid() and is_activated = true
    )
  );
