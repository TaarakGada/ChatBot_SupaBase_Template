import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export interface Profile {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Chat {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    name: string;
}

export interface Message {
    id: string;
    created_at: string;
    chat_id: string;
    content: string;
    message_type: 'text' | 'file' | 'voice';
    is_user: boolean;
    voice_url?: string | null;
    file_urls?: string[] | null;
    file_names?: string[] | null;
    files?: Array<{
        url: string;
        name: string;
        type?: string;
    }>;
}

export type MessageContent = {
    text?: string;
    file_urls?: string[] | null;
    file_names?: string[] | null;
    voice_url?: string | null;
};
