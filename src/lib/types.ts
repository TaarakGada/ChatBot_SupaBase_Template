export interface Message {
    id: string;
    created_at: string;
    chat_id: string;
    content: string;
    message_type: 'text' | 'file' | 'voice';
    is_user: boolean;
    file_urls?: string[] | null;
    file_names?: string[] | null;
    voice_url?: string | null;
}

export interface Chat {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    name: string;
}

export interface MessageContent {
    text: string;
    file_urls?: string[] | null;
    file_names?: string[] | null;
    voice_url?: string | null;
}

export interface FileAttachment {
    url: string;
    name: string;
}

// Database level types
export type Database = {
    public: {
        Tables: {
            chats: {
                Row: Chat;
                Insert: Omit<Chat, 'id' | 'created_at'>;
                Update: Partial<Omit<Chat, 'id'>>;
            };
            messages: {
                Row: Message;
                Insert: Omit<Message, 'id' | 'created_at'>;
                Update: Partial<Omit<Message, 'id'>>;
            };
        };
    };
};
