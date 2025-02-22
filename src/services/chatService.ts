import { supabase } from '@/lib/supabase';
import type { Chat, Message, MessageContent } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type ChatUpdate = Database['public']['Tables']['chats']['Update'];

export const chatService = {
    async fetchChats(userId: string): Promise<Chat[]> {
        console.log('Fetching chats for user:', userId);
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

    async updateChat(chatId: string, updates: ChatUpdate): Promise<void> {
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
        console.log('Saving message:', message);
        if (!message.chat_id) {
            console.error('chat_id is required');
            throw new Error('chat_id is required');
        }

        try {
            const messageData: Database['public']['Tables']['messages']['Insert'] = {
                chat_id: message.chat_id,
                content: message.content || '',
                message_type: message.message_type || 'text',
                is_user: message.is_user ?? true,
                file_urls: message.files ? message.files.map(f => f.url) : message.file_urls,
                file_names: message.files ? message.files.map(f => f.name) : message.file_names,
                voice_url: message.voice_url || null,
            };

            console.log('Inserting message into database:', messageData);
            const { data: newMessage, error: messageError } = await supabase
                .from('messages')
                .insert([messageData])
                .select()
                .single();

            if (messageError) {
                console.error('Error saving message:', messageError);
                throw messageError;
            }

            console.log('Message saved successfully:', newMessage);

            await this.updateChat(message.chat_id, {
                updated_at: new Date().toISOString()
            });

            return newMessage;
        } catch (error) {
            console.error('Error in saveMessage:', error);
            throw error;
        }
    },

    async uploadFile(file: File, userId: string): Promise<string> {
        if (!file || !userId) {
            throw new Error('File and userId are required');
        }

        console.log('Uploading file:', { fileName: file.name, userId });
        const fileExt = file.name.split('.').pop() || '';
        const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
            .from('chat-attachments')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(fileName);

        if (!publicUrl) {
            throw new Error('Failed to get public URL for uploaded file');
        }

        return publicUrl;
    }
};
