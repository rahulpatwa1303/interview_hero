// app/(app)/interview/new/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import { startNewInterviewAction, type CreateInterviewFormState } from '../actions'; // Import action and state type
import { toast } from 'sonner';
import { PiSpinner } from 'react-icons/pi';
import { useFormState, useFormStatus } from 'react-dom'; // Import both hooks
import { cn } from '@/lib/utils'; // For conditional class names

const initialState: CreateInterviewFormState = {
    success: false,
    message: undefined,
    error: undefined,
    sessionId: undefined,
};

// Separate component for the submit button to use useFormStatus
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
            {pending && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Starting..." : "Begin Session"}
        </Button>
    );
}

export default function NewInterviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialTopicFromUrl = useMemo(() => searchParams.get('topic') || '', [searchParams]);
    const isTopicFromUrlFixed = useMemo(() => !!initialTopicFromUrl, [initialTopicFromUrl]);

    // This state holds the value for the VISIBLE input field
    const [topicDisplayValue, setTopicDisplayValue] = useState(initialTopicFromUrl);

    const [state, formAction] = useFormState(startNewInterviewAction, initialState);

    useEffect(() => {
        // If URL parameter changes, update the visual input field's value
        setTopicDisplayValue(initialTopicFromUrl);
    }, [initialTopicFromUrl]);

    useEffect(() => {
        if (state?.success && state.sessionId) {
            toast.success(state.message || "Session started successfully!");
            router.push(`/interview/${state.sessionId}?q=1`);
        } else if (state && !state.success && (state.error || state.message)) {
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
                <form action={formAction} className="space-y-6">
                    {/* 
                        This hidden input ensures that the correct topic value is ALWAYS submitted
                        to the server action under the name "topic".
                        Its value is determined by whether the topic is fixed by the URL or editable.
                    */}
                    <input
                        type="hidden"
                        name="topic" // This name MUST MATCH what startNewInterviewAction expects (formData.get('topic'))
                        value={isTopicFromUrlFixed ? initialTopicFromUrl : topicDisplayValue}
                    />

                    <div className="space-y-1.5"> {/* Adjusted spacing for label and input */}
                        <Label htmlFor="topic_display_input">Interview Topic</Label>
                        <Input
                            id="topic_display_input"
                            // The 'name' attribute for this visible input is not strictly necessary for form submission
                            // if we rely on the hidden input. If kept, ensure it's different from the hidden input's name
                            // or ensure your server action only reads the intended 'topic' field.
                            // For simplicity, we can omit 'name' here or give it a distinct one.
                            // name="topic_visual_for_user" 
                            value={topicDisplayValue}
                            onChange={(e) => {
                                if (!isTopicFromUrlFixed) { // Only allow change if not fixed by URL
                                    setTopicDisplayValue(e.target.value);
                                }
                            }}
                            placeholder={isTopicFromUrlFixed ? initialTopicFromUrl : "e.g., Data Structures, System Design"}
                            disabled={isTopicFromUrlFixed}
                            aria-readonly={isTopicFromUrlFixed}
                            className={cn(
                                isTopicFromUrlFixed ? "bg-muted/70 cursor-not-allowed text-muted-foreground" : "",
                            )}
                        />
                        {isTopicFromUrlFixed && (
                            <p className="text-sm text-muted-foreground pt-1">
                                Topic is set by the previous selection.
                            </p>
                        )}
                        {!isTopicFromUrlFixed && (
                             <p className="text-sm text-muted-foreground pt-1">Leave blank for general tech practice.</p>
                        )}
                        {/* Example for field-specific errors from server action state */}
                        {state?.fieldErrors?.topic && <p className="text-sm text-destructive mt-1">{state.fieldErrors.topic}</p>}
                    </div>
                    <SubmitButton /> {/* Use the dedicated SubmitButton component */}
                </form>
            </CardContent>
        </Card>
    );
}