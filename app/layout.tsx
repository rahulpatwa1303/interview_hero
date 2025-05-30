// app/layout.tsx
import type { Metadata, Viewport } from "next"; // Import Viewport
import { Inter } from 'next/font/google'; // Example: Using Inter font
import "./globals.css";
import { AppTheme, CustomThemeProvider } from "@/components/theme-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";
import NextTopLoader from 'nextjs-toploader';

// Font Setup (Example with Inter)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // CSS variable for Tailwind
  display: 'swap', // Ensures text is visible while font loads
});

type ThemePreference = Database['public']['Tables']['users']['Row']['theme_preference'];

// ==============================================================================
// SEO: Root Metadata - Define defaults here, can be overridden by child pages
// ==============================================================================
export const metadata: Metadata = {
  // Generator: Useful for tools understanding how the site was built (optional)
  generator: 'Next.js',
  // Application Name: For Progressive Web Apps (PWA) and browser integrations
  applicationName: 'Interview Hero',
  // Referrer Policy: Controls information sent in Referer header (security/privacy)
  referrer: 'origin-when-cross-origin', // Common safe default
  // Keywords: Less impactful now, but can include a few core terms. Focus on content.
  keywords: ['AI interview practice', 'mock interview', 'technical interview prep', 'coding interview', 'software engineer interview'],
  // Author(s) of the website (optional)
  // authors: [{ name: 'Your Name/Company Name', url: 'https://your-website.com' }],
  // Color Scheme: Informs browser/OS about theme support (good with next-themes)
  colorScheme: 'light dark',
  // Theme Color: For browser UI theming (e.g., address bar on mobile)
  // themeColor: [ // Can provide different colors for light and dark
  //   { media: '(prefers-color-scheme: light)', color: '#ffffff' }, // Your light theme primary bg
  //   { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },  // Your dark theme primary bg
  // ],
  // Creator: Who created the content (optional)
  // creator: 'Your Name/Company Name',
  // Publisher: Who published the site (optional)
  // publisher: 'Your Name/Company Name',

  // Format Detection: Prevents browsers from auto-linking phone numbers (unless intended)
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // --- Core Metadata for SEO ---
  metadataBase: new URL('https://interview-hero-e4hl.vercel.app'), // IMPORTANT: Your production URL
  title: {
    default: 'Interview Hero: AI-Powered Mock Interview Practice', // Default title for all pages
    template: '%s | Interview Hero', // Template for child pages (e.g., "Dashboard | Interview Hero")
  },
  description: 'Ace your technical interviews with AI-driven mock interviews, personalized questions, and instant feedback. Prepare for coding, system design, and behavioral rounds.', // Default description
  
  // Open Graph (for social sharing - Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Interview Hero: AI-Powered Mock Interview Practice',
    description: 'Practice effectively and get AI feedback to land your dream tech job.',
    url: 'https://interview-hero-e4hl.vercel.app', // Canonical URL
    siteName: 'Interview Hero',
    // images: [ // Provide a good sharing image (e.g., 1200x630px)
    //   {
    //     url: 'https://interview-hero-e4hl.vercel.app/og-image.png', // Create and place this in /public
    //     width: 1200,
    //     height: 630,
    //     alt: 'Interview Hero App Interface',
    //   },
    // ],
    locale: 'en_US',
    type: 'website', // Or 'article' for blog posts, etc.
  },

  // Twitter Card (for sharing on Twitter)
  // twitter: {
  //   card: 'summary_large_image', // Use 'summary_large_image' if you have a good OG image
  //   title: 'Interview Hero: AI-Powered Mock Interview Practice',
  //   description: 'AI mock interviews to help you prepare for tech roles.',
  //   // siteId: 'YourTwitterSiteID', // Optional
  //   creator: '@YourTwitterHandle', // Optional: Your Twitter handle
    // creatorId: 'YourTwitterCreatorID', // Optional
  //   images: ['https://interview-hero-e4hl.vercel.app/twitter-image.png'], // Create a Twitter-specific image (e.g., 1200x675 or 2:1 ratio)
  // },

  // Icons (Favicons, Apple Touch Icon, etc.)
  // icons: {
  //   icon: '/favicon.ico', // Standard favicon
  //   shortcut: '/favicon-16x16.png',
  //   apple: '/apple-touch-icon.png',
    // other: [
    //   { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
    //   { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    // ],
  // },

  // Manifest for PWA (Progressive Web App) - if you plan to make it a PWA
  // manifest: '/manifest.json',

  // Robots: Controls crawling and indexing (can be overridden per page)
  // Default to allow all, then restrict specific pages if needed
  robots: {
    index: true,
    follow: true,
    googleBot: { // Specific instructions for GoogleBot
      index: true,
      follow: true,
      // 'max-video-preview': -1, // If you have videos
      // 'max-image-preview': 'large',
      // 'max-snippet': -1,
    },
  },

  // Verification tokens for search consoles (optional, can also be done via DNS or file upload)
  // verification: {
  //   google: 'YOUR_GOOGLE_SITE_VERIFICATION_TOKEN',
  //   yandex: 'YOUR_YANDEX_VERIFICATION_TOKEN',
  //   yahoo: 'YOUR_YAHOO_VERIFICATION_TOKEN',
  //   other: {
  //     me: ['your-email@example.com', 'link-to-your-about-page'],
  //   },
  // },

  // Apple Specific (for PWAs and web app feel on iOS)
  // appleWebApp: {
  //   title: 'Interview Hero',
  //   statusBarStyle: 'default', // or 'black-translucent'
  //   startupImage: [
  //     '/assets/startup/apple-touch-startup-image-768x1004.png',
  //     {
  //       url: '/assets/startup/apple-touch-startup-image-1536x2008.png',
  //       media: '(device-width: 768px) and (device-height: 1024px)',
  //     },
  //   ],
  // },
};

// ==============================================================================
// SEO: Viewport Configuration - Important for responsiveness and mobile SEO
// ==============================================================================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Or 2 if you want to allow user zooming
  // userScalable: false, // Set to true if you want to allow zooming
  // themeColor: [ // Duplicates themeColor in metadata, but Viewport is more specific for this
  //   { media: '(prefers-color-scheme: light)', color: 'white' },
  //   { media: '(prefers-color-scheme: dark)', color: 'black' },
  // ],
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let initialDbTheme: AppTheme = 'system';
  if (user) { /* ... your theme fetching logic ... */ }

  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      {/* No <head> here, Next.js handles metadata object */}
      <body>
        <NextTopLoader
          color="hsl(var(--primary))" // Use your primary CSS variable!
          height={3}
          showSpinner={false} // Spinner can sometimes be distracting
          crawl={true}
          initialPosition={0.08}
          crawlSpeed={200}
          easing="ease"
          speed={200}
        />
        <CustomThemeProvider initialDbTheme={initialDbTheme} user={user}>
          {children}
          <SonnerToaster richColors position="top-right" />
        </CustomThemeProvider>
      </body>
    </html>
  );
}