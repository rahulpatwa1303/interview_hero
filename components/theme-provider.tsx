// components/theme-provider.tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextThemeHook, type ThemeProviderProps } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { updateUserThemePreferenceAction } from '@/app/(app)/actions/user-settings-actions'; // Adjust path
import { User } from '@supabase/supabase-js';

export type AppTheme = 'light' | 'dark' | 'system';

interface CustomThemeProviderProps extends Omit<ThemeProviderProps, 'defaultTheme' | 'enableSystem' | 'theme'> { // Removed 'theme' from Omit
    initialDbTheme?: AppTheme | null;
    user?: User | null;
}

interface ThemeContextType {
    currentAppTheme: AppTheme;
    setAppTheme: (theme: AppTheme) => void;
    resolvedNextTheme?: string;
    isDbThemeLoaded: boolean;
}
const CustomThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({
    children,
    initialDbTheme,
    user,
    ...props // These are other ThemeProviderProps like 'attribute', 'storageKey', etc.
}: CustomThemeProviderProps) {
    // This state tracks our application's desired theme preference ('light', 'dark', 'system')
    const [appThemePreference, setAppThemePreference] = React.useState<AppTheme>(initialDbTheme || 'system');
    const [isDbThemeLoaded, setIsDbThemeLoaded] = React.useState(!!initialDbTheme || !user);

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system" // Initial default for next-themes before our logic kicks in
            enableSystem
            storageKey="ui-theme-actual" // next-themes' own storage key
            {...props} // Spread other valid NextThemesProvider props
        >
            <ThemeSyncAndContextProvider
                initialDbTheme={initialDbTheme}
                user={user}
                appThemePreference={appThemePreference}
                setAppThemePreference={setAppThemePreference}
                isDbThemeLoaded={isDbThemeLoaded}
                setIsDbThemeLoaded={setIsDbThemeLoaded}
            >
                {children}
            </ThemeSyncAndContextProvider>
        </NextThemesProvider>
    );
}

function ThemeSyncAndContextProvider({
    children,
    initialDbTheme,
    user,
    appThemePreference,         // This is the state from the parent CustomThemeProvider
    setAppThemePreference,    // This is the setState function from the parent
    isDbThemeLoaded,
    setIsDbThemeLoaded,
}: {
    children: React.ReactNode;
    initialDbTheme?: AppTheme | null;
    user?: User | null;
    appThemePreference: AppTheme;
    setAppThemePreference: React.Dispatch<React.SetStateAction<AppTheme>>;
    isDbThemeLoaded: boolean;
    setIsDbThemeLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const supabase = createClient();
    // `themeFromNextThemes` is the current theme according to next-themes ('light', 'dark', or 'system' initially then resolved 'light'/'dark')
    // `setNextThemesActual` is the function to tell next-themes to change the theme
    // `resolvedTheme` is the actual 'light' or 'dark' applied to the DOM
    const { theme: nextThemesCurrentSetting, setTheme: setNextThemesActual, resolvedTheme } = useNextThemeHook();

    // Effect 1: Load initial theme from DB if needed and set our appThemePreference.
    // This effect will also implicitly trigger Effect 2 if appThemePreference changes.
    React.useEffect(() => {
        let isMounted = true;
        async function loadInitialThemePreference() {
            if (initialDbTheme) { // If SSR provided a theme from DB
                if (isMounted && appThemePreference !== initialDbTheme) {
                    console.log(`ThemeSync Effect1: SSR theme '${initialDbTheme}' differs from current app pref '${appThemePreference}'. Updating app pref.`);
                    setAppThemePreference(initialDbTheme);
                }
                if (isMounted) setIsDbThemeLoaded(true);
                return;
            }
            
            if (user) { // No SSR theme, but we have a user client-side
                if (isMounted) setIsDbThemeLoaded(false); // Mark as loading
                console.log("ThemeSync Effect1: Fetching theme for user:", user.id);
                const { data: profile } = await supabase
                    .from('users')
                    .select('theme_preference')
                    .eq('id', user.id)
                    .single();

                if (!isMounted) return;

                const fetchedDbTheme = (profile?.theme_preference as AppTheme) || 'system';
                console.log("ThemeSync Effect1: DB theme fetched:", fetchedDbTheme);
                setAppThemePreference(fetchedDbTheme); // Update our app's preference state
                if (isMounted) setIsDbThemeLoaded(true);
            } else { // No user, no SSR theme
                if (isMounted) {
                    setAppThemePreference('system'); // Ensure our state is 'system'
                    setIsDbThemeLoaded(true);
                }
            }
        }

        if (!isDbThemeLoaded && (!initialDbTheme || user)) { // Fetch only if not loaded and (no initial OR user exists)
             loadInitialThemePreference();
        } else if (initialDbTheme && appThemePreference !== initialDbTheme) {
            // Case where initialDbTheme was provided, but appThemePreference might be different due to stale state
            // This ensures appThemePreference aligns with what was passed from server
            setAppThemePreference(initialDbTheme);
            if(isMounted) setIsDbThemeLoaded(true);
        }


        return () => { isMounted = false; };
    }, [user, initialDbTheme, supabase, appThemePreference, setAppThemePreference, setIsDbThemeLoaded, isDbThemeLoaded]);


    // Effect 2: When our appThemePreference changes, tell next-themes to apply it.
    // This is the crucial link for UI updates.
    React.useEffect(() => {
        if (isDbThemeLoaded && nextThemesCurrentSetting !== appThemePreference) {
            console.log(`ThemeSync Effect2: (Safeguard/Initial) appThemePreference ('${appThemePreference}') differs from next-themes setting ('${nextThemesCurrentSetting}'). Syncing next-themes.`);
            setNextThemesActual(appThemePreference);
        }
    }, [appThemePreference, isDbThemeLoaded, nextThemesCurrentSetting, setNextThemesActual]);

    const handleSetAppThemeAndPersist = async (newThemeToSet: AppTheme) => {
        const oldAppThemeForRollback = appThemePreference;
        
        // 1. Update our application's desired theme state.
        // This will trigger Effect 2, which calls setNextThemesActual, updating the UI.
        setAppThemePreference(newThemeToSet);
    
        // 2. Persist to DB if user exists
        if (user) {
            const result = await updateUserThemePreferenceAction(newThemeToSet);
            if (!result.success) {
                console.error("Failed to update theme in DB:", result.error);
                // Rollback our application's state if DB save fails.
                // This will also trigger Effect 2 to revert next-themes.
                setAppThemePreference(oldAppThemeForRollback);
                // toast.error("Could not save theme preference."); // Optional
            } else {
                console.log("Theme preference successfully saved to DB:", newThemeToSet);
            }
        }
    };
    
    return (
        <CustomThemeContext.Provider 
            value={{ 
                currentAppTheme: appThemePreference, 
                setAppTheme: handleSetAppThemeAndPersist, 
                resolvedNextTheme: resolvedTheme, // This comes from next-themes, already resolved 'system'
                isDbThemeLoaded 
            }}
        >
            {children}
        </CustomThemeContext.Provider>
    );
}
export const useAppTheme = () => {
    const context = React.useContext(CustomThemeContext);
    if (context === undefined) {
        throw new Error('useAppTheme must be used within a CustomThemeProvider');
    }
    return context;
};