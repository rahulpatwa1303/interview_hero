// app/(app)/coding-challenge/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { fetchQuickCodingChallengeAction } from './actions'; // Assuming actions are in the same folder
import ChallengeInterface from './ChallengeInterface'; // The new Client Component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface QuickCodingChallengePageProps {
    searchParams?: {
        topic?: string;
    }
}

export default async function QuickCodingChallengePage({ searchParams }: QuickCodingChallengePageProps) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login?redirectTo=/coding-challenge');
    }

    // Initial fetch of a challenge
    const userProvidedTopic = searchParams?.topic || null;
    const initialChallengeResult = await fetchQuickCodingChallengeAction(userProvidedTopic);


    return (
        <div className="container mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quick Coding Challenge</h1>
                <Button variant="outline" asChild>
                    <Link href="/interview">Back to Interview Hub</Link>
                </Button>
            </div>

            {initialChallengeResult.success && initialChallengeResult.challenge ? (
                <ChallengeInterface initialChallengeData={initialChallengeResult.challenge} />
            ) : (
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle /> Error Loading Challenge
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            {initialChallengeResult.error || "Could not load a coding challenge at this time. Please try again."}
                        </p>
                        <form action={async () => {
                            "use server";
                            redirect('/coding-challenge'); // Simple redirect to re-trigger fetch
                        }}>
                            <Button type="submit">Try Again</Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}