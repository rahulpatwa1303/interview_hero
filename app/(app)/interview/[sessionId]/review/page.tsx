// app/(app)/interview/[sessionId]/review/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // npx shadcn-ui@latest add accordion
import { Separator } from '@/components/ui/separator';

type Session = Database['public']['Tables']['interview_sessions']['Row'];
type Question = Database['public']['Tables']['interview_questions']['Row'];
type UserAnswer = Database['public']['Tables']['user_answers']['Row'];
type AIAnalysis = Database['public']['Tables']['ai_analysis_results']['Row'];
type UserProfile = Database['public']['Tables']['users']['Row'];

interface QuestionWithAnswerAndAnalysis extends Question {
    user_answers: (UserAnswer & { ai_analysis_results: AIAnalysis | null })[]; // User's answer for this question (should be one)
}

interface SessionForReview extends Session {
    users: UserProfile | null;
    interview_questions: QuestionWithAnswerAndAnalysis[];
    // overall_analysis: any | null; // Assuming you added this to interview_sessions
}


async function getAnalyzedSessionData(sessionId: string, userId: string): Promise<SessionForReview | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('interview_sessions')
        .select(`
            *,
            users (*),
            overall_analysis, 
            interview_questions (
                *,
                user_answers!inner ( 
                    *,
                    ai_analysis_results (*)
                )
            )
        `)
        .eq('id', sessionId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle as session might not be found or not belong to user

    if (error) {
        console.error("Error fetching analyzed session data:", error);
        // Log the error object itself for more details if it's not the PGRST100 one after fixing syntax
        if (error.code !== 'PGRST100') { // If it's a different error after syntax fix
            console.error("Detailed Supabase error:", JSON.stringify(error, null, 2));
        }
        return null;
    }
    if (data && data.interview_questions) {
        data.interview_questions.sort((a, b) => a.order_index - b.order_index);
        data.interview_questions.forEach(q => {
            if (q.user_answers) {
                if (Array.isArray(q.user_answers)) {
                    // @ts-ignore - Handle Supabase possibly returning array for one-to-one join
                    const answer = q.user_answers[0];
                    // @ts-ignore
                    if (answer.ai_analysis_results && Array.isArray(answer.ai_analysis_results)) {
                        // @ts-ignore
                        answer.ai_analysis_results = answer.ai_analysis_results.length > 0 ? answer.ai_analysis_results[0] : null;
                    } else if (answer.ai_analysis_results === undefined) { // If join yielded no analysis
                        // @ts-ignore
                        answer.ai_analysis_results = null;
                    }
                }
            }
        });
    }
    return data as SessionForReview | null;
}


export default async function InterviewReviewPage({ params }: { params: { sessionId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect(`/login?redirectTo=/interview/${params.sessionId}/review`);
    }

    const sessionData = await getAnalyzedSessionData(params.sessionId, user.id);

    if (!sessionData) {
        return notFound(); // Or a more user-friendly "Session not found or not analyzed yet."
    }

    const overallFeedback = sessionData.overall_analysis as { summary?: string, strengths?: string[], areas_for_improvement?: string[] } | null;

    return (
        <div className="flex flex-col h-full mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex-shrink-0 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Interview Review</h1>
                        <p className="text-muted-foreground">Session Topic: {sessionData.topic || "General Practice"}</p>
                        <p className="text-sm text-muted-foreground">
                            Completed on: {sessionData.completed_at ? new Date(sessionData.completed_at).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto space-y-6 pb-8 min-h-0">
                {/* Overall Feedback Section */}
                {overallFeedback && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Overall Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {overallFeedback.summary && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Summary:</h3>
                                    <p className="text-muted-foreground whitespace-pre-line">{overallFeedback.summary}</p>
                                </div>
                            )}
                            {overallFeedback.strengths && overallFeedback.strengths.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Strengths:</h3>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {overallFeedback.strengths.map((s, i) => <li key={`strength-${i}`}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                            {overallFeedback.areas_for_improvement && overallFeedback.areas_for_improvement.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Areas for Improvement:</h3>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {overallFeedback.areas_for_improvement.map((area, i) => <li key={`area-${i}`}>{area}</li>)}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Separator />

                {/* Per-Question Feedback Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Question by Question Analysis</h2>
                    {sessionData.interview_questions && sessionData.interview_questions.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            {sessionData.interview_questions.map((qwa, index) => {
                                const userAnswer = qwa.user_answers && qwa.user_answers.length > 0 ? qwa.user_answers[0] : null;
                                const analysis = userAnswer?.ai_analysis_results;
                                // Parse analysis_text if it's stored as stringified JSON
                                let evaluation: { rating?: string; good_points?: string[]; suggestions?: string[] } | null = null;
                                if (analysis?.analysis_text) {
                                    try {
                                        evaluation = JSON.parse(analysis.analysis_text);
                                    } catch (e) {
                                        console.error("Failed to parse analysis_text JSON:", e);
                                    }
                                } else if (analysis) { // Fallback if analysis_text is not structured JSON string but direct fields were used
                                    evaluation = {
                                        rating: analysis.rating || undefined,
                                        good_points: analysis.good_points?.split('\n- ').filter(p => p.trim() !== '') || [],
                                        suggestions: analysis.suggestions?.split('\n- ').filter(p => p.trim() !== '') || [],
                                    };
                                }


                                return (
                                    <AccordionItem value={`item-${index}`} key={qwa.id} className="border px-4 rounded-lg">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-left gap-2">
                                                <span className="font-medium text-base flex-1">Q{index + 1}: {qwa.question_text.substring(0, 100)}{qwa.question_text.length > 100 ? '...' : ''}</span>
                                                {evaluation?.rating && <Badge variant={
                                                    evaluation.rating.toLowerCase().includes('excellent') || evaluation.rating.toLowerCase().includes('good') ? 'default' :
                                                        evaluation.rating.toLowerCase().includes('needs improvement') || evaluation.rating.toLowerCase().includes('fair') ? 'secondary' : 'outline'
                                                }>{evaluation.rating}</Badge>}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-1 text-primary/80">Question ({qwa.question_type}):</h4>
                                                <p className="text-muted-foreground whitespace-pre-line">{qwa.question_text}</p>
                                            </div>
                                            <Separator />
                                            <div>
                                                <h4 className="font-semibold mb-1 text-primary/80">Your Answer:</h4>
                                                {userAnswer?.answer_text ? (
                                                    <p className="text-muted-foreground whitespace-pre-line">{userAnswer.answer_text}</p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No answer provided.</p>
                                                )}
                                            </div>
                                            {evaluation && (
                                                <>
                                                    <Separator />
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-primary/80">AI Feedback:</h4>
                                                        {evaluation.rating && <p className="mb-1"><strong className="text-sm">Rating:</strong> {evaluation.rating}</p>}
                                                        {evaluation.good_points && evaluation.good_points.length > 0 && (
                                                            <div className="mb-2">
                                                                <strong className="text-sm">Good Points:</strong>
                                                                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-0.5 mt-1">
                                                                    {evaluation.good_points.map((gp, i) => <li key={`gp-${index}-${i}`}>{gp}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                                                            <div>
                                                                <strong className="text-sm">Suggestions for Improvement:</strong>
                                                                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-0.5 mt-1">
                                                                    {evaluation.suggestions.map((sg, i) => <li key={`sg-${index}-${i}`}>{sg}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            {!userAnswer && <p className="text-sm text-muted-foreground italic mt-4">You did not answer this question, so no AI analysis is available.</p>}
                                            {userAnswer && !analysis && <p className="text-sm text-muted-foreground italic mt-4">AI analysis for this answer is not yet available or failed.</p>}
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    ) : (
                        <p className="text-muted-foreground">No questions or answers found for this session to review.</p>
                    )}
                </div>
            </div>
        </div>
    );
}