-- Add is_admin column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create weekly_themes table
CREATE TABLE IF NOT EXISTS public.weekly_themes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_themes ENABLE ROW LEVEL SECURITY;

-- Policies for weekly_themes
CREATE POLICY "Weekly themes are viewable by everyone"
  ON public.weekly_themes FOR SELECT
  USING ( true );

CREATE POLICY "Admins can insert weekly themes"
  ON public.weekly_themes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy for deleting posts (users can delete their own posts)
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING ( auth.uid() = user_id );

-- Helper to make the first user an admin (optional, user can run this manually with their ID)
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';
