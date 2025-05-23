// app/(app)/interview/[sessionId]/InterviewArea.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Database } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, Save, Mic, Code2, Edit3, SendHorizonal, LogOut } from 'lucide-react'; // Added icons
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge'; // Assuming you have Badge
import { cn } from '@/lib/utils'; // For conditional class names
import { PiSpinner } from 'react-icons/pi';
import MonacoCodeEditor from './CodeEditor';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { analyzeInterviewSessionAction, endInterviewSessionEarlyAction } from '../actions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Session = Database['public']['Tables']['interview_sessions']['Row'];
type Question = Database['public']['Tables']['interview_questions']['Row'];
type AnswerInsert = Database['public']['Tables']['user_answers']['Insert'];

// Simple check for coding question types
const isCodingQuestion = (type?: string | null) => {
    if (!type) return false;
    const lowerType = type.toLowerCase();
    return lowerType.includes('coding') || lowerType.includes('algorithm') || lowerType.includes('data_structure');
};

interface InterviewAreaProps {
    session: Session;
    initialQuestions: Question[];
}

export default function InterviewArea({ session, initialQuestions }: InterviewAreaProps) {
    const supabase = createClient();
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
    const [isLoadingSavedAnswer, setIsLoadingSavedAnswer] = useState(false);
    const [isAnswerAreaVisible, setIsAnswerAreaVisible] = useState(false);
    const [isCodeInputMode, setIsCodeInputMode] = useState(false);
    const [isRecognizingSpeech, setIsRecognizingSpeech] = useState(false);
    const answerTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [currentLanguage, setCurrentLanguage] = useState('javascript');
    const [answerIsCode, setAnswerIsCode] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const AUTO_SAVE_DELAY = 5000; // 5 seconds

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialIndexFromUrl = parseInt(searchParams.get('q') || '1', 10) - 1; // q=1 is index 0
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
        // Ensure initial index is valid and within bounds of available questions
        Math.max(0, Math.min(initialIndexFromUrl, initialQuestions.length > 0 ? initialQuestions.length - 1 : 0))
    );

    const currentQuestion = questions[currentQuestionIndex];

    // Speech Recognition API (basic placeholder)
    const recognitionRef = useRef<SpeechRecognition | null>(null);



    useEffect(() => {
        // Initialize SpeechRecognition
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionAPI) {
                recognitionRef.current = new SpeechRecognitionAPI();
                recognitionRef!.current!.continuous! = false; // Process single utterances
                recognitionRef.current!.interimResults = false;
                recognitionRef.current!.lang = 'en-US';

                recognitionRef.current!.onresult = (event) => {
                    const transcript = event.results[event.results.length - 1][0].transcript;
                    setCurrentAnswer(prev => prev ? prev + ' ' + transcript : transcript);
                    setIsRecognizingSpeech(false);
                };
                recognitionRef.current!.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    toast(event.error || 'Could not recognize speech.');
                    setIsRecognizingSpeech(false);
                };
                recognitionRef.current!.onend = () => {
                    setIsRecognizingSpeech(false);
                };
            }
        } else {
            console.warn('Speech Recognition API not supported in this browser.');
        }
        return () => {
            recognitionRef.current?.stop();
        }
    }, [toast]);

    useEffect(() => {
        const newUrl = `${pathname}?q=${currentQuestionIndex + 1}`; // q=1 for index 0
        router.replace(newUrl, { scroll: false }); // Use replace to not clutter browser history
    }, [currentQuestionIndex, pathname, router]);

    const handleAnswerChange = (newAnswer: string, lang?: string) => {
        setCurrentAnswer(newAnswer);
        if (lang) {
            setCurrentLanguage(lang);
        }
        if (isAnswerAreaVisible) {
            triggerAutoSave();
        }
    }

    // Load saved answer and determine input mode when question changes
    useEffect(() => {
        if (currentQuestion) {
            setIsLoadingSavedAnswer(true);
            const isItCoding = isCodingQuestion(currentQuestion.question_type);
            setIsCodeInputMode(isItCoding); // Set default mode based on question type

            const fetchAnswer = async () => {
                const { data: existingAnswerData } = await supabase
                    .from('user_answers')
                    .select('answer_text, metadata') // Assuming you add a metadata column to store language
                    .eq('question_id', currentQuestion.id)
                    .eq('user_id', session.user_id)
                    .maybeSingle();

                let savedText = '';
                let savedLang = 'javascript'; // Default language
                let savedAnswerIsCode = isItCoding; // Assume current mode if no saved answer

                if (existingAnswerData) {
                    savedText = existingAnswerData.answer_text || '';
                    // Assuming metadata is a JSONB column like: { language: 'python', isCode: true }
                    if (existingAnswerData.metadata && typeof existingAnswerData.metadata === 'object') {
                        const meta = existingAnswerData.metadata as any;
                        savedLang = meta.language || 'javascript';
                        savedAnswerIsCode = meta.isCode !== undefined ? meta.isCode : isItCoding;
                    }
                } else if (answers[currentQuestion.id]) { // Check local cache if any
                    savedText = answers[currentQuestion.id];
                    // If you cache language/isCode locally, retrieve it here
                }

                setCurrentAnswer(savedText);
                setCurrentLanguage(savedLang);
                setIsCodeInputMode(savedAnswerIsCode); // Set mode based on saved answer's nature or question type
                setAnswerIsCode(savedAnswerIsCode); // Track if the loaded answer was code

                setIsLoadingSavedAnswer(false);
                if (isAnswerAreaVisible && !isCodeInputMode) { // Only focus textarea for non-code mode
                    answerTextareaRef.current?.focus();
                }
            };
            fetchAnswer();
        }
    }, [currentQuestion, session.user_id, supabase, answers, isAnswerAreaVisible]);
    const toggleAnswerArea = () => {
        setIsAnswerAreaVisible(prev => {
            const nextVisibility = !prev;
            if (nextVisibility && currentQuestion) {
                // If becoming visible, ensure answer is loaded (useEffect above handles this)
                // and focus. We might need a slight delay for focus if DOM isn't ready.
                setTimeout(() => answerTextareaRef.current?.focus(), 0);
            }
            return nextVisibility;
        });
    };

    const handleNavigateQuestion = (direction: 'next' | 'prev') => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = null; // Clear ref
        }
        if (isAnswerAreaVisible && currentAnswer.trim()) {
            saveCurrentAnswer(false);
        }
        if (isAnswerAreaVisible && currentAnswer.trim()) {
            saveCurrentAnswer(false); // Auto-save before navigating if answer area was open and had text
        }

        let newIndex = currentQuestionIndex;
        if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
            newIndex = currentQuestionIndex + 1;
        } else if (direction === 'prev' && currentQuestionIndex > 0) {
            newIndex = currentQuestionIndex - 1;
        }

        if (newIndex !== currentQuestionIndex) {
            setCurrentQuestionIndex(newIndex);
            setCurrentAnswer(''); // Clear for next question (will be refetched/loaded)
            // setIsCodeInputMode(isCodingQuestion(questions[newIndex]?.question_type)); // Set mode for next q
            // setIsAnswerAreaVisible(false); // Optionally hide answer area on navigate
        }
    };

    const saveCurrentAnswer = async (showToast = true) => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = null;
        }
        if (!currentQuestion || !currentAnswer.trim()) {
            if (showToast && currentQuestion) toast("Answer is empty, not saved.");
            return;
        }
        setIsSubmittingAnswer(true);
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentAnswer }));

        const payload: AnswerInsert = {
            question_id: currentQuestion.id,
            user_id: session.user_id,
            answer_text: currentAnswer,
            // Store language and if it's code in a metadata JSONB column
            metadata: isCodeInputMode ? { language: currentLanguage, isCode: true } : { isCode: false },
        };

        // Your user_answers table needs a 'metadata' column of type JSONB (nullable)
        // ALTER TABLE public.user_answers ADD COLUMN metadata JSONB;

        const { error } = await supabase
            .from('user_answers')
            .upsert(payload, { onConflict: 'question_id, user_id' });

        setIsSubmittingAnswer(false);
        if (error) {
            toast(error.message);
        } else {
            setAnswerIsCode(isCodeInputMode); // Update persistent state of answer type
            if (showToast) toast('Answer Saved!');
        }
    };

    const triggerAutoSave = useCallback(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
            if (currentAnswer.trim()) { // Only save if there's content
                console.log("Auto-saving answer...");
                saveCurrentAnswer(true); // Show toast for auto-save for feedback
            }
        }, AUTO_SAVE_DELAY);
    }, [currentAnswer, saveCurrentAnswer]);

    const handleFinishInterview = async () => {
        if (currentAnswer.trim()) await saveCurrentAnswer(false); // Save the last answer

        setIsSubmittingAnswer(true); // Keep this for the initial status update
        const { error: updateSessionError } = await supabase
            .from('interview_sessions')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', session.id);
        setIsSubmittingAnswer(false);

        if (updateSessionError) {
            toast("Error finishing interview: " + updateSessionError.message);
            return;
        }

        toast('Interview session marked as complete! Now starting analysis...');
        setIsAnalyzing(true); // Set loading state for analysis

        const analysisResult = await analyzeInterviewSessionAction(session.id);

        setIsAnalyzing(false);
        if (analysisResult.success) {
            toast('Analysis complete! You can view it on your dashboard or review page.');
            // Redirect to a review page or dashboard
            // For now, just redirect to dashboard.
            window.location.href = `/dashboard?message=Interview+completed+and+analyzed&sessionId=${session.id}`;
        } else {
            toast("Analysis failed: " + (analysisResult.error || 'Unknown error during analysis.'));
            // Still redirect, but maybe with an error message for analysis
            window.location.href = `/dashboard?message=Interview+completed+but+analysis+failed&sessionId=${session.id}`;
        }
    };

    const toggleSpeechToText = () => {
        if (!recognitionRef.current) {
            toast("Speech recognition is not available in your browser.");
            return;
        }
        if (isRecognizingSpeech) {
            recognitionRef.current.stop();
            setIsRecognizingSpeech(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsRecognizingSpeech(true);
                toast("Listening...");
            } catch (err) {
                console.error("Error starting speech recognition:", err);
                toast("Could not start listening.");
                setIsRecognizingSpeech(false);
            }
        }
    };

    const handleLeaveInterview = async () => {
        setIsLeaving(true);
        toast("Ending session...");

        // 1. Save the current answer if any
        if (currentAnswer.trim()) {
            await saveCurrentAnswer(false); // Save without showing the usual "Answer Saved" toast
        }

        // 2. Call a server action to update the session status
        const result = await endInterviewSessionEarlyAction(session.id);

        setIsLeaving(false);
        if (result.success) {
            toast.success("Interview session ended.");
            window.location.href = '/dashboard?message=Interview+ended'; // Or to a review page if applicable
        } else {
            toast.error(result.error || "Could not end the interview session. Please try again.");
            // Stay on the page or offer a retry
        }
    };


    if (!currentQuestion) {
        return <p className="text-center text-muted-foreground p-8">Loading question or no questions available.</p>;
    }

    const isCurrentCodingQuestion = isCodingQuestion(currentQuestion.question_type);

    return (
        <Card className="w-full flex flex-col min-h-[calc(100vh-200px)] max-h-[calc(100vh-180px)] overflow-hidden"> {/* Adjust min-height as needed */}
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg sm:text-xl break-words">Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                    {currentQuestion.question_type && <Badge variant="outline">{currentQuestion.question_type}</Badge>}
                </div>
                <CardDescription className="text-lg pt-2 whitespace-pre-wrap">{currentQuestion.question_text}</CardDescription>
            </CardHeader>

            {/* Answer Area - Conditionally Rendered */}
            <CardContent className="flex-grow flex flex-col overflow-y-auto px-4 py-2 sm:px-6 sm:py-4 min-h-0">
                {!isAnswerAreaVisible ? (
                    <div className="flex-grow flex items-center justify-center">
                        <Button variant="outline" size="lg" onClick={toggleAnswerArea}>
                            <Edit3 className="mr-2 h-5 w-5" /> Show Answer Pad
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="answer" className="text-base font-semibold">Your Response</Label>
                            <div className="flex items-center gap-2">
                                {isCurrentCodingQuestion && (
                                    <Button
                                        variant={isCodeInputMode ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setIsCodeInputMode(!isCodeInputMode)}
                                        title={isCodeInputMode ? "Switch to Text Input" : "Switch to Code Input"}
                                    >
                                        <Code2 className="h-4 w-4 mr-1" /> {isCodeInputMode ? "Text" : "Code"}
                                    </Button>
                                )}
                                <Button
                                    variant={isRecognizingSpeech ? "destructive" : "ghost"}
                                    size="sm"
                                    onClick={toggleSpeechToText}
                                    title={isRecognizingSpeech ? "Stop Listening" : "Start Speech-to-Text"}
                                    disabled={!recognitionRef.current}
                                >
                                    <Mic className="h-4 w-4" />
                                    {isRecognizingSpeech && <span className="ml-1 animate-pulse text-xs">Listening...</span>}
                                </Button>
                            </div>
                        </div>
                        {isCodeInputMode ? (
                            <div className="flex-grow flex flex-col h-[calc(100vh-250px)] max-h-[250px]"> {/* Container for Monaco */}
                                <MonacoCodeEditor
                                    key={`${currentQuestion.id}-${currentLanguage}`} // Force re-render on language change if needed for model update
                                    initialCode={currentAnswer} // Pass current answer as initial code
                                    language={currentLanguage}
                                    onChange={(code, lang) => handleAnswerChange(code, lang)}
                                    onLanguageChange={setCurrentLanguage} // Allow editor to update parent's language
                                    height="100%" // Let it fill its container
                                    theme={(typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'vs-dark' : 'light'}
                                />
                            </div>
                        ) : (
                            <Textarea
                                ref={answerTextareaRef}
                                id="answer"
                                value={currentAnswer}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                placeholder="Type your thoughts or verbal answer here..."
                                disabled={isSubmittingAnswer || isLoadingSavedAnswer}
                                className="flex-grow resize-none w-full min-h-[200px] max-h-[250px]"
                            />
                        )}
                        {isLoadingSavedAnswer && <p className="text-sm text-muted-foreground mt-1">Loading saved answer...</p>}
                        <Button onClick={() => saveCurrentAnswer()} variant="default" size="sm" className="mt-3 w-full sm:w-auto sm:self-end" disabled={isSubmittingAnswer || !currentAnswer.trim()}>
                            {isSubmittingAnswer && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="h-4 w-4 mr-1" /> Save Progress
                        </Button>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t pt-4">
                <Button onClick={() => handleNavigateQuestion('prev')} disabled={currentQuestionIndex === 0 || isSubmittingAnswer} variant="outline">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="w-full sm:w-auto order-last sm:order-none" disabled={isLeaving || isSubmittingAnswer}>
                            <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Leave</span><span className="sm:hidden">Leave Interview</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Your progress so far will be saved. You can review this session later, but you won't be able to resume it.
                                The session will be marked as completed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveInterview} disabled={isLeaving} className="bg-destructive hover:bg-destructive/90">
                                {isLeaving && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, Leave Interview
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} / {questions.length}
                </div>
                {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                        onClick={handleFinishInterview}
                        disabled={isSubmittingAnswer || isAnalyzing} // Disable if submitting OR analyzing
                        className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                    >
                        {(isSubmittingAnswer || isAnalyzing) && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                        {isAnalyzing ? 'Analyzing...' : (isSubmittingAnswer ? 'Finishing...' : 'Finish Interview')}
                    </Button>
                ) : (
                    <Button onClick={() => handleNavigateQuestion('next')} disabled={isSubmittingAnswer} variant="outline">
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}