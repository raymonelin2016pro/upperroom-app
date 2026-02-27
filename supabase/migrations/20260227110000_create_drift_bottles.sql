-- Create drift_bottles table
CREATE TABLE drift_bottles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) > 0),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE drift_bottles ENABLE ROW LEVEL SECURITY;

-- Policies

-- Allow anyone to read drift bottles (for picking one up)
CREATE POLICY "Drift bottles are viewable by everyone" 
ON drift_bottles FOR SELECT 
USING (true);

-- Allow authenticated users to create drift bottles
CREATE POLICY "Users can insert their own drift bottles" 
ON drift_bottles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to delete their own bottles? 
-- Maybe not necessary for MVP, but good practice.
CREATE POLICY "Users can delete their own drift bottles" 
ON drift_bottles FOR DELETE 
USING (auth.uid() = user_id);
