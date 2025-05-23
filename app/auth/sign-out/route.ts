import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const requestUrl = new URL(request.url);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not sign out user`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?message=Logged out successfully`);
}