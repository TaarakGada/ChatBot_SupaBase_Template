import { supabase } from '@/lib/supabase';

interface User {
    id: string;
    name: string;
    email: string;
}

export const userService = {
    async upsertUser(user: User) {
        const { error, data } = await supabase
            .from('users')
            .upsert(user, { onConflict: 'id' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
