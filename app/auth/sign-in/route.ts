// app/auth/sign-in/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server'; // Import NextRequest
import { type Provider } from '@supabase/supabase-js';

// Helper to construct the absolute callback URL (more robust)
const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??         // User-defined, highest priority (ensure it's set in Vercel)
    process.env.NEXT_PUBLIC_VERCEL_URL ??      // Vercel system env var for Preview Deployments
    'http://localhost:3000';                   // Fallback for local development
  // Ensure it starts with https for Vercel deployments
  url = url.startsWith('http') ? url : `https://${url}`;
  // Ensure no trailing slash, as /auth/callback will be appended
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  return url;
};

export async function POST(request: NextRequest) { // Use NextRequest for easier access to origin if needed
  const supabase = createClient();
  const { provider } = (await request.json()) as { provider: Provider };

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  // Use the helper or ensure NEXT_PUBLIC_SITE_URL is absolutely correct
  const siteUrl = getURL();
  const redirectTo = `${siteUrl}/auth/callback`;

  console.log(`[Auth SignIn] Initiating OAuth for ${provider}. RedirectTo: ${redirectTo}`);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo,
      // Optional: Add scopes if needed, e.g., for Google
      // queryParams: { access_type: 'offline', prompt: 'consent' }
    },
  });

  if (error) {
    console.error('[Auth SignIn] Error signing in with OAuth:', error.message);
    // Return JSON error to the client
    return NextResponse.json(
      { error: `Could not authenticate with ${provider}: ${error.message}` },
      { status: 500 }
    );
  }

  if (!data.url) {
    console.error('[Auth SignIn] No URL returned from signInWithOAuth');
    return NextResponse.json(
      { error: `Could not get OAuth URL for ${provider}` },
      { status: 500 }
    );
  }

  // Return the URL in a JSON response for the client to handle the redirect
  console.log(`[Auth SignIn] Successfully got OAuth URL: ${data.url}`);
  return NextResponse.json({ url: data.url });
}