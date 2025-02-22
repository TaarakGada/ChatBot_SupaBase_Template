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
                    created_at: string
                    id: string
                    name: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    name: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    name?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "chats_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            messages: {
                Row: {
                    chat_id: string
                    content: string
                    created_at: string
                    file_names: string[] | null
                    file_urls: string[] | null
                    id: string
                    is_user: boolean
                    message_type: string
                    voice_url: string | null
                }
                Insert: {
                    chat_id: string
                    content: string
                    created_at?: string
                    file_names?: string[] | null
                    file_urls?: string[] | null
                    id?: string
                    is_user: boolean
                    message_type: string
                    voice_url?: string | null
                }
                Update: {
                    chat_id?: string
                    content?: string
                    created_at?: string
                    file_names?: string[] | null
                    file_urls?: string[] | null
                    id?: string
                    is_user?: boolean
                    message_type?: string
                    voice_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_chat_id_fkey"
                        columns: ["chat_id"]
                        isOneToOne: false
                        referencedRelation: "chats"
                        referencedColumns: ["id"]
                    }
                ]
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
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
