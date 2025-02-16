-- Enable RLS
alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Create tables
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message text,
  last_message_at timestamp with time zone
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  content jsonb not null, -- Stores message content as JSON to handle different types
  is_user boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade
);

-- Create indexes
create index chat_user_id_idx on public.chats(user_id);
create index message_chat_id_idx on public.messages(chat_id);

-- Create RLS policies
create policy "Users can view their own profile"
  on public.profiles for select
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
