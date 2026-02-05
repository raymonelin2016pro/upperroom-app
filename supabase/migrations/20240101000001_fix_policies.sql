
-- Fix Profile Policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

-- Fix Posts Policies (Ensure profiles are joined correctly)
drop policy if exists "Posts are viewable by everyone" on posts;
create policy "Posts are viewable by everyone"
  on posts for select
  using ( true );

-- Ensure authenticated users can read all posts
drop policy if exists "Authenticated users can read posts" on posts;
create policy "Authenticated users can read posts"
  on posts for select
  to authenticated
  using ( true );
