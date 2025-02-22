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
    user_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    chat_id: string;
    content: string;
    message_type: 'text' | 'file' | 'voice';
    file_urls?: string[];
    file_names?: string[];
    file_url?: string; // for backward compatibility
    is_user: boolean;
    created_at: string;
    updated_at: string;
}

export type MessageContent = {
    type: 'text' | 'file' | 'voice';
    text?: string;
    urls?: string[];
    names?: string[];
    url?: string;  // for backward compatibility with voice messages
    name?: string; // for backward compatibility with voice messages
};
