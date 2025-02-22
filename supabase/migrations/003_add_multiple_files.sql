-- Add new columns for multiple files
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS file_urls text[],
ADD COLUMN IF NOT EXISTS file_names text[];

-- Copy existing file_url data to file_urls array
UPDATE public.messages
SET file_urls = ARRAY[file_url]
WHERE file_url IS NOT NULL;

-- Copy existing content to file_names array for file type messages
UPDATE public.messages
SET file_names = ARRAY[content]
WHERE message_type = 'file';

-- Make file_url nullable since we're migrating to file_urls
ALTER TABLE public.messages
ALTER COLUMN file_url DROP NOT NULL;
