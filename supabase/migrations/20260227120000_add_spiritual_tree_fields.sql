-- Add growth_points and last_check_in to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS growth_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMP WITH TIME ZONE;

-- Add comment to explain usage
COMMENT ON COLUMN profiles.growth_points IS 'Points for the Spiritual Tree growth';
COMMENT ON COLUMN profiles.last_check_in IS 'Timestamp of the last daily scripture check-in';
