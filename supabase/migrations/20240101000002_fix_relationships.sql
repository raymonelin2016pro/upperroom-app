
-- Re-create the foreign key relationship explicitly
alter table public.posts 
drop constraint if exists posts_user_id_fkey;

alter table public.posts
add constraint posts_user_id_fkey 
foreign key (user_id) 
references auth.users(id)
on delete cascade;

-- Also add a relationship to profiles for easier joining if needed, 
-- though usually joining via auth.users or directly to profiles on id is fine.
-- Let's ensure profiles.id references auth.users.id
alter table public.profiles
drop constraint if exists profiles_id_fkey;

alter table public.profiles
add constraint profiles_id_fkey
foreign key (id)
references auth.users(id)
on delete cascade;

-- Important: For PostgREST to detect the relationship between 'posts' and 'profiles',
-- since they both reference auth.users, we sometimes need an explicit FK between them 
-- OR we just need to ensure the schema cache is reloaded.
-- Let's add a direct FK from posts.user_id to profiles.id to make it unambiguous for PostgREST
alter table public.posts
add constraint posts_user_id_profiles_fkey
foreign key (user_id)
references public.profiles(id);
