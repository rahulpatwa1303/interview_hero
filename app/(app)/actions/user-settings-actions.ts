// app/(app)/actions/user-settings-actions.ts (or a similar actions file)
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache'; // May not be strictly needed for theme, but good if profile page shows it
import { Database } from '@/lib/database.types';

type ThemePreference = Database['public']['Tables']['users']['Row']['theme_preference']; // 'light' | 'dark' | 'system' | null

export interface UpdateThemePreferenceResult {
    success: boolean;
    error?: string;
    newTheme?: ThemePreference;
}

export async function updateUserThemePreferenceAction(
    newTheme: ThemePreference
): Promise<UpdateThemePreferenceResult> {
    if (!newTheme || !['light', 'dark', 'system'].includes(newTheme)) {
        return { success: false, error: "Invalid theme preference provided." };
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        const { error: updateError } = await supabase
            .from('users')
            .update({ theme_preference: newTheme })
            .eq('id', user.id);

        if (updateError) {
            console.error("Error updating theme preference in DB:", updateError);
            return { success: false, error: `Database error: ${updateError.message}` };
        }

        console.log(`User ${user.id} theme preference updated to ${newTheme}`);
        // Revalidate paths where user profile data might be displayed if it shows theme
        // revalidatePath('/profile'); 
        // revalidatePath('/settings');
        return { success: true, newTheme };

    } catch (e: any) {
        console.error("Unexpected error updating theme preference:", e);
        return { success: false, error: "An unexpected error occurred." };
    }
}