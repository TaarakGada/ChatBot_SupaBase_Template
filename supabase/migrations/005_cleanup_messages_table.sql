-- Remove redundant columns
ALTER TABLE messages 
DROP COLUMN IF EXISTS file_url;

-- Ensure new columns are correctly set up
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS file_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS file_names text[] DEFAULT '{}';
