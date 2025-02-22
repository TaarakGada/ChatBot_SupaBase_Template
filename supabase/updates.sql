-- Drop the messages table first since it depends on the message_type
DROP TABLE IF EXISTS public.messages;

-- Now we can safely drop and recreate the type
DROP TYPE IF EXISTS message_type;
CREATE TYPE message_type AS ENUM ('text', 'file', 'voice');

-- Recreate the messages table
CREATE TABLE public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type message_type DEFAULT 'text' NOT NULL,
  file_url text,
  is_user boolean DEFAULT true,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Re-enable RLS and create index for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS message_chat_id_idx ON public.messages(chat_id);

-- Recreate message policies
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users can view messages in their chats"
  ON public.messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.chats WHERE id = messages.chat_id
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON public.messages;
CREATE POLICY "Users can insert messages in their chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.chats WHERE id = chat_id
    )
  );

DROP POLICY IF EXISTS "Users can update messages in their chats" ON public.messages;
CREATE POLICY "Users can update messages in their chats"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.chats WHERE id = messages.chat_id
    )
  );

DROP POLICY IF EXISTS "Users can delete messages in their chats" ON public.messages;
CREATE POLICY "Users can delete messages in their chats"
  ON public.messages FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.chats WHERE id = messages.chat_id
    )
  );
