-- Fix foreign key constraints to cascade delete

-- For likes table
ALTER TABLE public.likes
DROP CONSTRAINT IF EXISTS likes_post_id_fkey;

ALTER TABLE public.likes
ADD CONSTRAINT likes_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES public.posts(id)
ON DELETE CASCADE;

-- For comments table
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_post_id_fkey;

ALTER TABLE public.comments
ADD CONSTRAINT comments_post_id_fkey
FOREIGN KEY (post_id)
REFERENCES public.posts(id)
ON DELETE CASCADE;
