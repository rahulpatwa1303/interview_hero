// app/(app)/interview/[sessionId]/page.tsx
import { redirect } from 'next/navigation';
import { getInterviewData, generateAndInsertQuestionsAction } from '../actions'; // Import new action
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import InterviewArea from './InterviewArea';
import Link from 'next/link';
import GenerateQuestionsButton from './GenerateQuestionsButton'; // New client component
import { Suspense } from 'react';
export const dynamicParams = true;



function InterviewAreaLoadingFallback() {
    return (
        <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Loading interview interface...</p>
            {/* You can add a spinner here */}
        </div>
    );
}

export default async function InterviewSessionPage({ params }: { params: any }) {
    const sessionId = (await params).sessionId;

    const { session, error } = await getInterviewData(sessionId);

    if (error === 'User not authenticated') { // Check specific error string from getInterviewData
        return redirect(`/login?redirectTo=/interview/${sessionId}`);
    }

    if (error || !session) {
        console.error("Error in InterviewSessionPage (initial fetch):", error);
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold text-destructive">Error</h1>
                <p className="mt-2">{error || 'Could not load interview session.'}</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        );
    }

    const questions = session.interview_questions || [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Interview: {session.topic || 'General Practice'}</CardTitle>
                    <CardDescription>
                        Session started on: {new Date(session.started_at).toLocaleString()}
                        {session.users && <span> for {session.users.name}</span>}
                    </CardDescription>
                    <Badge>{session.status}</Badge>
                </CardHeader>
                <CardContent>
                    {questions.length > 0 ? (
                        <Suspense fallback={<InterviewAreaLoadingFallback />}>
                            <InterviewArea session={session} initialQuestions={questions} />
                        </Suspense>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground mb-4">
                                No questions found for this session yet.
                            </p>
                            {/* Client component button to trigger question generation */}
                            <GenerateQuestionsButton sessionId={sessionId} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}