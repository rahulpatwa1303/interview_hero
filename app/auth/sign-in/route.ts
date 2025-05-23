import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type Provider } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabase = createClient();
  const { provider } = (await request.json()) as { provider: Provider };

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('Error signing in with OAuth:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=Could not authenticate user`);
  }

  return NextResponse.redirect(data.url);
}