'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner"
import { LuLoaderCircle } from "react-icons/lu";
import { LuGithub } from "react-icons/lu";
import { PiGoogleLogoLight } from "react-icons/pi";

// Create components/icons.tsx (optional, but good practice)
// npm install lucide-react
// components/icons.tsx
/*
import {
  LucideProps,
  Github,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Chrome // For Google icon
} from "lucide-react"

export const Icons = {
  gitHub: Github,
  google: Chrome, // Using Chrome icon as a stand-in for Google logo
  spinner: Loader2,
  warning: AlertTriangle,
  success: CheckCircle2,
};
*/


export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (errorParam && messageParam) {
      toast(decodeURIComponent(messageParam),);
    } else if (messageParam) {
      toast(decodeURIComponent(messageParam),);
    }
    // Clear search params after showing toast to prevent re-showing on refresh/navigation
    // router.replace('/login', { scroll: false }); // This can be aggressive, use if needed
  }, [searchParams, toast, router]);


  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    if (provider === 'google') setIsLoadingGoogle(true);
    if (provider === 'github') setIsLoadingGithub(true);

    try {
      const response = await fetch('/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const result = await response.json(); // Always parse JSON

      if (!response.ok) { // Check if response status is not 2xx
        // Error came from our /auth/sign-in route
        throw new Error(result.error || `Failed to initiate ${provider} sign-in. Status: ${response.status}`);
      }

      if (result.url) {
        // This is the Supabase OAuth URL, navigate to it
        window.location.href = result.url;
        // Don't setIsLoadingXxx(false) here, as the page will navigate away
      } else {
        // Should not happen if response.ok is true and route is correct, but good to have
        throw new Error(`No redirect URL received for ${provider}.`);
      }

    } catch (error: any) {
      console.error(`OAuth Sign-In Error (${provider}):`, error);
      toast.error(error.message || `Could not initiate ${provider} sign-in.`);
      if (provider === 'google') setIsLoadingGoogle(false);
      if (provider === 'github') setIsLoadingGithub(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      // It's important this uses a client-side Supabase instance
      const { data: { session } } = await supabase.auth.getSession();
      console.log("LoginPage: Client-side session check:", session);
      if (session) {
        console.log("LoginPage: Session found, redirecting to /dashboard");
        router.push('/dashboard'); // Or to a previously intended URL
      }
    };
    checkUser();

    // Also listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("LoginPage: onAuthStateChange event:", event, "session:", session);
      if (event === 'SIGNED_IN' && session) {
        console.log("LoginPage: SIGNED_IN event, redirecting to /dashboard");
        router.push('/dashboard');
      }
      // Handle SIGNED_OUT if needed
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-2">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Choose your preferred sign-in method.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoadingGoogle || isLoadingGithub}
            className="w-full"
          >
            {isLoadingGoogle ? (
              <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PiGoogleLogoLight className="mr-2 h-4 w-4" /> // Or your preferred Google icon
            )}
            Sign in with Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoadingGoogle || isLoadingGithub}
            className="w-full"
          >
            {isLoadingGithub ? (
              <LuLoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LuGithub className="mr-2 h-4 w-4" />
            )}
            Sign in with GitHub
          </Button>
        </CardContent>
        {/* Removed CardFooter, messages are handled by Toasts now */}
      </Card>
    </div>
  );
}