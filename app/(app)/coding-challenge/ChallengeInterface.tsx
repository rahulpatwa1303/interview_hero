// app/(app)/coding-challenge/ChallengeInterface.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Database } from '@/lib/database.types'; // For types if needed directly
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchQuickCodingChallengeAction, runCodeAndEvaluateAction, RunCodeResult, TestCaseResult } from './actions'; // Import actions and types
import { toast } from 'sonner';
import { PiSpinner } from 'react-icons/pi';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Lightbulb } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For language selector if not in MonacoCodeEditor
import MonacoCodeEditor from '../interview/[sessionId]/CodeEditor';
import { Badge } from '@/components/ui/badge';

// Type for the challenge data passed from server and managed in state
type ChallengeDisplayData = NonNullable<Awaited<ReturnType<typeof fetchQuickCodingChallengeAction>>['challenge']>;

// Supported languages for the editor (should align with your sandbox)
const supportedLanguagesForChallenge = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    // Add more as your sandbox supports
];


export default function ChallengeInterface({ initialChallengeData }: { initialChallengeData: ChallengeDisplayData }) {
    const [challenge, setChallenge] = useState<ChallengeDisplayData>(initialChallengeData);
    const [userCode, setUserCode] = useState<string>(initialChallengeData.initial_code_snippet || '');
    const [selectedLanguage, setSelectedLanguage] = useState<string>(initialChallengeData.default_language || 'javascript');

    const [isRunningCode, setIsRunningCode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // For a final submission if different from run
    const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
    const [overallStatus, setOverallStatus] = useState<RunCodeResult['overallStatus'] | null>(null);
    const [consoleOutput, setConsoleOutput] = useState<string | null>(null); // For stdout/stderr

    useEffect(() => {
        // When challenge changes, reset code and language
        setUserCode(challenge.initial_code_snippet || '');
        setSelectedLanguage(challenge.default_language || 'javascript');
        setTestResults([]);
        setOverallStatus(null);
        setConsoleOutput(null);
    }, [challenge]);

    const handleCodeChange = (code: string, lang: string) => {
        setUserCode(code);
        // If MonacoCodeEditor doesn't handle language change propagation, handle it here
        if (lang !== selectedLanguage) setSelectedLanguage(lang);
    };

    const handleLanguageChange = (lang: string) => {
        setSelectedLanguage(lang);
        // Potentially update userCode if you have different initial snippets per language for the same challenge
        // For now, assumes initial_code_snippet is generic or for the default_language
    };

    const executeCode = async (runAll: boolean) => {
        if (!challenge) return;
        setIsRunningCode(true);
        setTestResults([]);
        setOverallStatus(null);
        setConsoleOutput(null);
        toast.info("Running your code...");

        const payload = {
            challengeId: challenge.id,
            language: selectedLanguage,
            code: userCode,
            runAllTests: runAll, // True for "Submit", false for "Run Code" (visible tests only)
        };

        const result = await runCodeAndEvaluateAction(payload);
        setIsRunningCode(false);

        if (result.success) {
            setTestResults(result.results || []);
            setOverallStatus(result.overallStatus || null);
            toast.success("Code execution finished!");
            // Combine stdout/stderr for a simple console output
            let output = "";
            (result.results || []).forEach(r => {
                if (r.stdout) output += `Test Case ${r.testCaseId.substring(0, 4)}... stdout:\n${r.stdout}\n`;
                if (r.stderr) output += `Test Case ${r.testCaseId.substring(0, 4)}... stderr:\n${r.stderr}\n`;
            });
            setConsoleOutput(output.trim() || null);
        } else {
            toast.error(result.error || "Failed to run code.");
            setOverallStatus('runtime_error'); // Or a generic error status
            setConsoleOutput(result.error || "An unknown error occurred.");
        }
    };

    const fetchNextChallenge = async () => {
        setIsRunningCode(true); // Use same loading state or a new one
        toast.info("Fetching next challenge...");
        const nextChallengeResult = await fetchQuickCodingChallengeAction();
        if (nextChallengeResult.success && nextChallengeResult.challenge) {
            setChallenge(nextChallengeResult.challenge);
        } else {
            toast.error(nextChallengeResult.error || "Could not load next challenge.");
        }
        setIsRunningCode(false);
    };


    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full flex-grow min-h-0">
            {/* Left Panel: Problem Statement & Test Cases */}
            <ScrollArea className="lg:w-1/2 lg:pr-3 h-full lg:max-h-[calc(100vh-180px)]"> {/* Max height for scrolling */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl">{challenge.title || "Coding Challenge"}</CardTitle>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="capitalize">{challenge.difficulty || 'N/A'}</Badge>
                            <Badge variant="outline" className="capitalize">{challenge.category || 'General'}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none flex-grow">
                        {/* Use dangerouslySetInnerHTML if problem_statement is trusted HTML/Markdown, otherwise parse safely */}
                        <div dangerouslySetInnerHTML={{ __html: challenge.problem_statement || "<p>No problem description.</p>" }} />
                    </CardContent>
                    {(challenge.visible_test_cases && challenge.visible_test_cases.length > 0) && (
                        <CardFooter className="border-t pt-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Example Test Cases:</h4>
                                <div className="space-y-2">
                                    {challenge.visible_test_cases.map((tc, index) => (
                                        <div key={tc.id || index} className="text-xs p-2 bg-muted/50 rounded">
                                            <p><strong>Input:</strong> <pre className="inline whitespace-pre-wrap">{JSON.stringify(tc.input)}</pre></p>
                                            {/* Don't show expected output for visible examples before run */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </ScrollArea>

            {/* Right Panel: Code Editor & Results */}
            <div className="lg:w-1/2 flex flex-col gap-4 h-full lg:max-h-[calc(100vh-180px)]"> {/* Max height for scrolling */}
                {/* Language Selector integrated into MonacoCodeEditor or separate */}
                <div className="flex-shrink-0">
                    <Label htmlFor="language-select-challenge" className="text-sm font-medium">Language:</Label>
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isRunningCode}>
                        <SelectTrigger id="language-select-challenge" className="w-[180px] h-9 mt-1">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {supportedLanguagesForChallenge.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-grow flex flex-col min-h-[300px] h-0 border rounded-md"> {/* Editor container */}
                    <MonacoCodeEditor
                        key={challenge.id + selectedLanguage} // Re-mount editor if challenge or language changes drastically
                        initialCode={userCode}
                        language={selectedLanguage}
                        onChange={handleCodeChange}
                        // onLanguageChange={setSelectedLanguage} // Handled by separate Select now
                        theme={(typeof window !== "undefined" && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) ? 'vs-dark' : 'light'}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Button onClick={() => executeCode(false)} disabled={isRunningCode || !userCode.trim()} variant="outline" className="flex-1">
                        {isRunningCode && overallStatus !== 'passed' && overallStatus !== 'failed_tests' ? <PiSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Run Code (Visible Tests)
                    </Button>
                    <Button onClick={() => executeCode(true)} disabled={isRunningCode || !userCode.trim()} className="flex-1">
                        {isRunningCode && overallStatus !== 'passed' && overallStatus !== 'failed_tests' ? <PiSpinner className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Solution
                    </Button>
                    <Button onClick={fetchNextChallenge} disabled={isRunningCode} variant="secondary" className="flex-1 sm:flex-none">
                        <RefreshCw className="mr-2 h-4 w-4" /> Next Challenge
                    </Button>
                </div>

                {/* Results Area */}
                {(testResults.length > 0 || consoleOutput) && (
                    <ScrollArea className="h-[200px] sm:h-[250px] border rounded-md p-3 bg-muted/30 flex-shrink-0">
                        <h3 className="text-md font-semibold mb-2">Results:
                            {overallStatus && (
                                <Badge variant={overallStatus === 'passed' ? 'default' : 'destructive'} className="ml-2 capitalize">
                                    {overallStatus.replace('_', ' ')}
                                </Badge>
                            )}
                        </h3>
                        {consoleOutput && (
                            <div className="mb-3">
                                <h4 className="text-xs font-medium text-muted-foreground">Console Output / Errors:</h4>
                                <pre className="text-xs whitespace-pre-wrap bg-background p-2 rounded mt-1">{consoleOutput}</pre>
                            </div>
                        )}
                        {testResults.map((result, index) => (
                            <div key={result.testCaseId || index} className="text-xs mb-2 p-2 border-b last:border-b-0">
                                <div className="flex items-center gap-2 font-medium">
                                    {result.passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                                    Test Case #{index + 1}: {result.passed ? "Passed" : "Failed"}
                                </div>
                                <p><strong>Input:</strong> <pre className="inline whitespace-pre-wrap">{JSON.stringify(result.input)}</pre></p>
                                {!result.passed && result.expectedOutput && (
                                    <p><strong>Expected:</strong> <pre className="inline whitespace-pre-wrap">{JSON.stringify(result.expectedOutput)}</pre></p>
                                )}
                                {!result.passed && result.actualOutput && (
                                    <p><strong>Got:</strong> <pre className="inline whitespace-pre-wrap">{result.actualOutput}</pre></p>
                                )}
                                {result.error && <p className="text-destructive mt-1"><strong>Error:</strong> {result.error}</p>}
                            </div>
                        ))}
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}