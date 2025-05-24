// components/landing/InteractiveDemo.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lightbulb, MessageSquareText, ThumbsUp, AlertTriangle, BrainCircuit } from 'lucide-react';
import { PiSpinner } from 'react-icons/pi';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

const demoQuestions = [
    {
        id: "demo_q1",
        text: "Tell me about a challenging project you worked on and how you overcame the obstacles.",
        type: "behavioral"
    },
    {
        id: "demo_q2",
        text: "Explain the concept of closures in JavaScript with a simple example.",
        type: "technical_concept"
    }
];

interface AIFeedback {
    strength?: string;
    improvement?: string;
    overall_comment?: string;
}

export default function InteractiveDemo() {
    const [currentDemoQuestionIndex, setCurrentDemoQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentDemoQuestion = demoQuestions[currentDemoQuestionIndex];

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) {
            toast.warning("Please provide an answer to get feedback.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAiFeedback(null);

        try {
            const response = await fetch('/api/demo-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: currentDemoQuestion.text, answer: userAnswer }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get feedback from AI.');
            }
            setAiFeedback(data.feedback);
        } catch (err: any) {
            console.error("Demo submission error:", err);
            setError(err.message || "An error occurred.");
            toast.error(err.message || "An error occurred while fetching feedback.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextQuestion = () => {
        setUserAnswer('');
        setAiFeedback(null);
        setError(null);
        setCurrentDemoQuestionIndex((prevIndex) => (prevIndex + 1) % demoQuestions.length);
    }

    return (
        <section className="py-16 sm:py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-primary" /> Try a Quick Demo!
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Experience a snippet of our AI-powered interview feedback.
                    </p>
                </div>

                <Card className="max-w-2xl mx-auto shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Demo Question {currentDemoQuestionIndex + 1}</CardTitle>
                        <CardDescription className="text-base pt-1">{currentDemoQuestion.text}</CardDescription>
                        <Badge variant="outline" className="w-fit mt-1">{currentDemoQuestion.type}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="demo-answer" className="font-semibold">Your Answer:</Label>
                            <Textarea
                                id="demo-answer"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                rows={5}
                                className="mt-1"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            {demoQuestions.length > 1 && (
                                <Button variant="outline" onClick={handleNextQuestion} disabled={isLoading}>
                                    Next Question
                                </Button>
                            )}
                            <Button onClick={handleSubmitAnswer} disabled={isLoading || !userAnswer.trim()}>
                                {isLoading && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                                Get AI Feedback
                            </Button>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 border border-destructive/50 bg-destructive/10 rounded-md text-destructive text-sm flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> {error}
                            </div>
                        )}

                        {aiFeedback && !error && (
                            <div className="mt-6 p-4 border border-primary/30 bg-primary/5 rounded-lg space-y-3 animate-fadeIn">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" /> AI Feedback:
                                </h3>
                                {aiFeedback.overall_comment && (
                                    <p className="italic text-muted-foreground">"{aiFeedback.overall_comment}"</p>
                                )}
                                {aiFeedback.strength && (
                                    <div className="text-sm">
                                        <strong className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <ThumbsUp className="h-4 w-4" /> Strength:
                                        </strong>
                                        <p className="ml-1 pl-4 text-muted-foreground">{aiFeedback.strength}</p>
                                    </div>
                                )}
                                {aiFeedback.improvement && (
                                    <div className="text-sm">
                                        <strong className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                            <MessageSquareText className="h-4 w-4" /> Improvement Area:
                                        </strong>
                                        <p className="ml-1 pl-4 text-muted-foreground">{aiFeedback.improvement}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}