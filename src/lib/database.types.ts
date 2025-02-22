export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            chats: {
                Row: {
                    id: string
                    name: string
                    user_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    chat_id: string
                    content: string
                    message_type: 'text' | 'file' | 'voice'
                    file_url: string | null
                    is_user: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    chat_id: string
                    content: string
                    message_type?: 'text' | 'file' | 'voice'
                    file_url?: string | null
                    is_user?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    chat_id?: string
                    content?: string
                    message_type?: 'text' | 'file' | 'voice'
                    file_url?: string | null
                    is_user?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    name: string
                    email: string
                    tokens: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    email: string
                    tokens?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    tokens?: number
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            message_type: 'text' | 'file' | 'voice'
        }
    }
}
