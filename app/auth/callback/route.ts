import { createClient } from '@/lib/supabase/server'; // Updated to use our server client helper
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types'; // Make sure this path is correct
import { redirect } from 'next/navigation'; // Use next/navigation for redirects in Route Handlers

// Note: createServerClient from '@supabase/ssr' is already handled by our lib/supabase/server.ts
// and cookies() is also handled there.

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin; // For redirecting back to the app

  console.log('Callback GET received. Code:', code ? 'present' : 'missing');

  if (code) {
    const supabase = createClient(); // Uses cookies() internally

    console.log('Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // console.log('exchangeCodeForSession result:', data, error); // Log the whole data for better insight

    if (error) {
      console.error("Error exchanging code for session:", error.message, error);
      // Redirect to an error page or login page with error message
      return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
    }
    
    if (data.session && data.user) {
       console.log(`Session obtained for user: ${data.user.id}. Checking public.users...`);
      // Check/Create public.users entry
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, profile_complete')
        .eq('id', data.user.id)
        .single();

      if (userError) {
         if (userError.code === 'PGRST116') { // No row found
            console.log(`User ${data.user.id} not found in public.users, creating...`);
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!, // Non-null assertion, ensure email is always present
                name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email,
                avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
                profile_complete: false, // Default to false
              });

            if (createError) {
               console.error("Error creating user in public.users:", createError);
               // Redirect to an error page or login page with error message
               return NextResponse.redirect(`${origin}/login?error=user_creation_failed&message=${encodeURIComponent(createError.message)}`);
            }

            console.log('User created, redirecting to /profile/setup');
            // Use NextResponse.redirect for Route Handlers
            return NextResponse.redirect(`${origin}/profile/setup`);

         } else {
             console.error("Error fetching user from public.users:", userError);
             return NextResponse.redirect(`${origin}/login?error=profile_fetch_error&message=${encodeURIComponent(userError.message)}`);
         }

      } else if (userData) { // User data was fetched successfully
         if (!userData.profile_complete) {
             console.log(`User ${data.user.id} (${userData.name || data.user.email}) found, but profile incomplete, redirecting to /profile/setup.`);
            //  return NextResponse.redirect(`${origin}/profile/setup`);
            return NextResponse.redirect(`${origin}/dashboard`);
         } else {
              console.log(`User ${data.user.id} (${userData.name || data.user.email}) found, profile complete, redirecting to /dashboard.`);
              return NextResponse.redirect(`${origin}/dashboard`);
         }
      }
    } else {
        console.error("No session or user data returned after code exchange.");
        return NextResponse.redirect(`${origin}/login?error=auth_failed&message=No session data`);
    }
  }

  console.error("No code provided in callback URL.");
  // Redirect to login page if no code is present
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}

// The POST handler for sign-out is now in app/auth/sign-out/route.ts
// So, it's removed from here.