-- Add new columns to messages table for multiple files
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS file_urls text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS file_names text[] DEFAULT '{}';

-- Copy existing data
UPDATE messages 
SET file_urls = ARRAY[file_url],
    file_names = ARRAY[content]
WHERE message_type = 'file' AND file_url IS NOT NULL;
