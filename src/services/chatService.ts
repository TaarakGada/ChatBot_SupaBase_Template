import { supabase } from '../lib/supabase';
import type { Chat, Message } from '../lib/supabase';

export const chatService = {
    async fetchChats(userId: string): Promise<Chat[]> {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createChat(userId: string, name: string): Promise<Chat> {
        const { data, error } = await supabase
            .from('chats')
            .insert([{ user_id: userId, name }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateChat(chatId: string, updates: Partial<Chat>): Promise<void> {
        const { error } = await supabase
            .from('chats')
            .update(updates)
            .eq('id', chatId);

        if (error) throw error;
    },

    async deleteChat(chatId: string): Promise<void> {
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId);

        if (error) throw error;
    },

    async fetchMessages(chatId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async saveMessage(message: Partial<Message>): Promise<Message> {
        if (!message.chat_id) {
            throw new Error('chat_id is required');
        }

        // Validate message type and required fields
        if ((message.message_type === 'file' || message.message_type === 'voice') && !message.file_url) {
            throw new Error('File URL is required for file/voice messages');
        }

        const { data, error } = await supabase
            .from('messages')
            .insert([message])
            .select()
            .single();

        if (error) throw error;

        // Update chat's updated_at timestamp
        await this.updateChat(message.chat_id, {
            updated_at: new Date().toISOString()
        });

        return data;
    },

    async uploadFile(file: File, userId: string): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
            .from('chat-attachments')  // Using our new bucket name
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(fileName);

        return publicUrl;
    }
};
