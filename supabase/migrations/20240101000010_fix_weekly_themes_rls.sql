-- Fix RLS policies for weekly_themes table to ensure visibility for all users
-- and strict editing rights for admins only.

-- 1. Enable RLS (idempotent)
ALTER TABLE public.weekly_themes ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to clean up potential misconfigurations
DROP POLICY IF EXISTS "Weekly themes are viewable by everyone" ON public.weekly_themes;
DROP POLICY IF EXISTS "Admins can insert weekly themes" ON public.weekly_themes;
-- Also drop any potentially conflicting policies that might have been created manually
DROP POLICY IF EXISTS "Enable read access for all users" ON public.weekly_themes;
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.weekly_themes;

-- 3. Create explicit SELECT policy for ALL users (anon + authenticated)
CREATE POLICY "Weekly themes are viewable by everyone"
  ON public.weekly_themes FOR SELECT
  TO public
  USING ( true );

-- 4. Create INSERT policy strictly for Admins
CREATE POLICY "Admins can insert weekly themes"
  ON public.weekly_themes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. Explicitly grant permissions to roles (fixes issues where table permissions might be missing)
GRANT SELECT ON public.weekly_themes TO anon, authenticated;
GRANT INSERT ON public.weekly_themes TO authenticated;
