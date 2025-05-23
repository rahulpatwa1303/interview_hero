// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AppTheme, CustomThemeProvider } from "@/components/theme-provider"; // Import your custom provider
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server"; // Server client for initial fetch
import { Database } from "@/lib/database.types";
import NextTopLoader from 'nextjs-toploader';


type ThemePreference = Database['public']['Tables']['users']['Row']['theme_preference'];

export const metadata: Metadata = { /* ... */ };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialDbTheme: AppTheme = 'system'; // Default

  if (user) {
    const { data: profile, error } = await supabase
      .from('users')
      .select('theme_preference')
      .eq('id', user.id)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error("RootLayout: Error fetching initial theme:", error);
    }
    if (profile && profile.theme_preference) {
      const dbThemeValue = profile.theme_preference;
      // Validate and cast
      if (dbThemeValue === 'light' || dbThemeValue === 'dark' || dbThemeValue === 'system') {
        initialDbTheme = dbThemeValue as AppTheme;
      } else {
        initialDbTheme = 'system'; // Default to system if DB value is unexpected
      }
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
      <NextTopLoader
          color="#2463EB" // Choose your primary/accent color
          initialPosition={0.08}
          crawlSpeed={200}
          height={3} // Height of the progress bar
          crawl={true}
          showSpinner={true} // Shows a small spinner
          easing="ease"
          speed={200}
          shadow="0 0 10px #2463EB,0 0 5px #2463EB" // Optional shadow
          // template='<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>' // Custom template
          // zIndex={1600}
          // showAtBottom={false}
        />
        <CustomThemeProvider
          initialDbTheme={initialDbTheme} // Pass initial theme
          user={user}                       // Pass user for client-side logic in provider
        // Props for NextThemesProvider (can be omitted if defaults are fine)
        // attribute="class"
        // enableSystem // Handled within CustomThemeProvider now by setting default to 'system' initially
        // disableTransitionOnChange 
        >
          {/* Your main app structure */}
          {children}
          <SonnerToaster richColors position="top-right" />
        </CustomThemeProvider>
      </body>
    </html>
  );
}