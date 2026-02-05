-- Enable RLS for posts if not already enabled (it should be)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy for deleting posts: allow admins to delete any post
CREATE POLICY "Admins can delete any post"
  ON public.posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Note: The existing "Users can delete own posts" policy covers the owner case.
-- Since RLS policies are permissive (OR), having both allows either owner OR admin to delete.
