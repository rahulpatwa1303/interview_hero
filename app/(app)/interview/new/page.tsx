// app/(app)/interview/new/page.tsx
'use client';

// REMOVE: import { createClient } from '@/lib/supabase/server'; // Not used in client component
import { useSearchParams, useRouter } from 'next/navigation'; // useRouter for potential client-side nav if action fails before redirect
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { CreateInterviewFormState, startNewInterviewAction } from '../actions'; // Ensure this path is correct
import { toast } from 'sonner'; // For showing messages
import { PiSpinner } from 'react-icons/pi'; // Assuming you have this for loading
import { useFormState } from 'react-dom';

const initialState: CreateInterviewFormState = {
    success: false,
    message: undefined, // Use undefined so initial toasts don't fire
    error: undefined,
    sessionId: undefined,
};

export default function NewInterviewPage() {
    const searchParams = useSearchParams();
    const router = useRouter(); // For potential fallback navigation

    // Use useMemo for stability and clarity
    const initialTopicFromUrl = useMemo(() => searchParams.get('topic') || '', [searchParams]);
    const isTopicFromUrlFixed = useMemo(() => !!initialTopicFromUrl, [initialTopicFromUrl]);

    // This state will hold the value for the input field
    const [topicInputValue, setTopicInputValue] = useState(initialTopicFromUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // If the URL parameter changes (e.g., browser back/forward), update the input field's value
        setTopicInputValue(initialTopicFromUrl);
    }, [initialTopicFromUrl]);

    // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    //     event.preventDefault(); // Prevent default form submission
    //     setIsSubmitting(true);

    //     const formData = new FormData(event.currentTarget); // Get form data

    //     // Determine the actual topic to submit
    //     // If fixed by URL, use that. Otherwise, use the (potentially empty) input value.
    //     const topicToSubmit = isTopicFromUrlFixed ? initialTopicFromUrl : formData.get('topic_input_display')?.toString() || '';

    //     // Create a new FormData to send to the action, ensuring 'topic' field is correct
    //     const actionFormData = new FormData();
    //     actionFormData.append('topic', topicToSubmit.trim() || 'General Tech Practice');

    //     try {
    //         // Server action `startNewInterviewAction` is expected to handle redirects on success/failure.
    //         // If it returns a value (e.g., an error object), we won't easily get it here
    //         // because the redirect will likely happen first.
    //         // This is a limitation of not using useFormState for actions that redirect.
    //         await startNewInterviewAction(actionFormData);
    //         // If the action redirects, this line below might not be reached.
    //         // If it doesn't redirect on error, we wouldn't know without a return value.
    //         // For now, assume success if no error is thrown that prevents redirect.
    //     } catch (error) {
    //         // This catch block might not catch errors if the server action itself handles
    //         // errors by redirecting (e.g., to a dashboard with an error query param).
    //         // It would catch network errors or if the action throws an unhandled exception.
    //         console.error("Error submitting form:", error);
    //         toast.error("Failed to start interview. Please try again.");
    //         setIsSubmitting(false);
    //     }
    //     // No need to setIsSubmitting(false) here if successful redirect, as component unmounts.
    // };

    const [state, formAction] = useFormState(startNewInterviewAction, initialState);

    useEffect(() => {
        if (state?.success && state.sessionId) {
            toast(state.message || "Session started successfully!");
            router.push(`/interview/${state.sessionId}?q=1`);
        } else if (state && !state.success && (state.error || state.message)) {
            // This will catch the "You have reached your daily limit..." error
            toast.error(state.error || state.message || "Failed to start interview.");
        }
    }, [state, router]);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Start New Interview</CardTitle>
                <CardDescription>
                    {isTopicFromUrlFixed
                        ? `Starting a session focused on: "${initialTopicFromUrl}".`
                        : "Define a topic or leave blank for general practice."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6"> {/* Changed to onSubmit */}
                    <div className='space-y-4'>
                        <Label htmlFor="topic_input_display">Interview Topic</Label>
                        <Input
                            id="topic_input_display"
                            name="topic_input_display" // Name for FormData if needed when editable
                            value={topicInputValue}
                            onChange={(e) => setTopicInputValue(e.target.value)}
                            placeholder={isTopicFromUrlFixed ? "" : "e.g., Data Structures, System Design"}
                            disabled={isTopicFromUrlFixed} // Disable if topic comes from URL
                            aria-readonly={isTopicFromUrlFixed}
                            className={isTopicFromUrlFixed ? "bg-muted/50 cursor-not-allowed" : ""}
                        />
                        {isTopicFromUrlFixed && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Topic is set by previous selection. To choose a different topic or a general session, please start from the Interview Hub or Dashboard.
                            </p>
                        )}
                        {!isTopicFromUrlFixed && (
                            <p className="text-sm text-muted-foreground mt-1">Leave blank for general tech practice.</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Starting..." : "Begin Session"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}