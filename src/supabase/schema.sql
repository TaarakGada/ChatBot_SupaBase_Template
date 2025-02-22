create table public.users (
  id uuid not null,
  name text not null,
  email text not null,
  tokens integer null default 0,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.messages (
  id uuid not null default extensions.uuid_generate_v4 (),
  chat_id uuid not null,
  content text not null,
  message_type public.message_type not null default 'text'::message_type,
  is_user boolean null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  file_urls text[] null,
  file_names text[] null,
  voice_url text null,
  constraint messages_pkey primary key (id),
  constraint messages_chat_id_fkey foreign KEY (chat_id) references chats (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists message_chat_id_idx on public.messages using btree (chat_id) TABLESPACE pg_default;

create table public.chats (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  user_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint chats_pkey primary key (id),
  constraint chats_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists chat_user_id_idx on public.chats using btree (user_id) TABLESPACE pg_default;