import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export const userService = {
    async upsertUser(user: Profile) {
        const { error, data } = await supabase
            .from('users')
            .upsert(user, { onConflict: 'id' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
