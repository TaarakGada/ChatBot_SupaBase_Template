-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create message type enum first
create type message_type as enum ('text', 'file', 'voice');

-- Create tables first
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text unique not null,
  tokens integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  content text not null,
  message_type message_type default 'text' not null,
  file_url text,
  is_user boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS after tables are created
alter table public.users enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Create indexes
create index chat_user_id_idx on public.chats(user_id);
create index message_chat_id_idx on public.messages(chat_id);

-- Create storage bucket for files
insert into storage.buckets (id, name, public) 
values ('chat-attachments', 'chat-attachments', false)
on conflict do nothing;

-- Storage bucket policy
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own files"
  on storage.objects for select
  using (
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create RLS policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can view their own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can create their own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chats"
  on public.chats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

create policy "Users can view messages in their chats"
  on public.messages for select
  using (
    auth.uid() in (
      select user_id from public.chats where id = messages.chat_id
    )
  );

create policy "Users can insert messages in their chats"
  on public.messages for insert
  with check (
    auth.uid() in (
      select user_id from public.chats where id = chat_id
    )
  );

create policy "Users can update messages in their chats"
  on public.messages for update
  using (
    auth.uid() in (
      select user_id from public.chats where id = messages.chat_id
    )
  );

create policy "Users can delete messages in their chats"
  on public.messages for delete
  using (
    auth.uid() in (
      select user_id from public.chats where id = messages.chat_id
    )
  );

-- Storage bucket policies
create policy "Users can view their own attachments"
    on storage.objects for select
    using (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own attachments"
    on storage.objects for insert
    with check (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own attachments"
    on storage.objects for update
    using (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own attachments"
    on storage.objects for delete
    using (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
