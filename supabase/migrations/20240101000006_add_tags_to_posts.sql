-- Add tag column to posts table
ALTER TABLE posts ADD COLUMN tag text;

-- Create an index for faster filtering by tag
CREATE INDEX idx_posts_tag ON posts(tag);
