import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Profile {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Chat {
    id: string;
    name: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    last_message?: string;
    last_message_at?: string;
}

export interface Message {
    id: string;
    chat_id: string;
    content: {
        text?: string;
        type?: 'text' | 'audio' | 'file';
        url?: string;
        name?: string;
    };
    is_user: boolean;
    created_at: string;
    user_id?: string;
}
