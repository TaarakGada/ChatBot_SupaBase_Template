import { SupabaseClient } from '@supabase/supabase-js';

export async function ensureVoiceUrlColumnExists(supabase: SupabaseClient) {
    // Check if the column exists first to avoid errors
    const { data: columns } = await supabase
        .from('messages')
        .select()
        .limit(1);

    // If the column doesn't exist in the result, add it
    if (columns && !('voice_url' in columns[0])) {
        const { error } = await supabase.rpc('add_voice_url_column');
        if (error) {
            console.error('Error adding voice_url column:', error);
            throw error;
        }
    }
}
