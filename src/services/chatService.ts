import { supabase } from '../lib/supabase';
import type { Chat, Message } from '../lib/supabase';

export const chatService = {
    async fetchChats(userId: string): Promise<Chat[]> {
        // const { data, error } = await supabase
        //     .from('chats')
        //     .select('*')
        //     .eq('user_id', userId)
        //     .order('last_message_at', { ascending: false });

        // if (error) throw error;
        // return data || [];
        return []; // Placeholder return value
    },

    async createChat(userId: string, name: string): Promise<Chat> {
        // const { data, error } = await supabase
        //     .from('chats')
        //     .insert([{ user_id: userId, name }])
        //     .select()
        //     .single();

        // if (error) throw error;
        // return data;
        return { id: '1', name, user_id: userId, created_at: '', updated_at: '' }; // Placeholder return value
    },

    async updateChat(chatId: string, updates: Partial<Chat>): Promise<void> {
        // const { error } = await supabase
        //     .from('chats')
        //     .update(updates)
        //     .eq('id', chatId);

        // if (error) throw error;
    },

    async deleteChat(chatId: string): Promise<void> {
        // const { error } = await supabase
        //     .from('chats')
        //     .delete()
        //     .eq('id', chatId);

        // if (error) throw error;
    },

    async fetchMessages(chatId: string): Promise<Message[]> {
        // const { data, error } = await supabase
        //     .from('messages')
        //     .select('*')
        //     .eq('chat_id', chatId)
        //     .order('created_at', { ascending: true });

        // if (error) throw error;
        // return data || [];
        return []; // Placeholder return value
    },

    async saveMessage(message: Partial<Message>): Promise<Message> {
        // const { data, error } = await supabase
        //     .from('messages')
        //     .insert([message])
        //     .select()
        //     .single();

        // if (error) throw error;
        // return data;
        return { id: '1', chat_id: message.chat_id!, content: message.content!, is_user: message.is_user!, created_at: '', user_id: message.user_id }; // Placeholder return value
    },

    async uploadFile(file: File, userId: string): Promise<string> {
        // const fileExt = file.name.split('.').pop();
        // const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
        // const { error: uploadError, data } = await supabase.storage
        //     .from('chat-files')
        //     .upload(fileName, file);

        // if (uploadError) throw uploadError;

        // const { data: { publicUrl } } = supabase.storage
        //     .from('chat-files')
        //     .getPublicUrl(fileName);

        // return publicUrl;
        return 'https://example.com/file'; // Placeholder return value
    }
};
