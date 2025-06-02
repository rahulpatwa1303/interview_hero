// app/(app)/coding-challenge/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';
import { GenerationConfig, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

type CodingChallenge = Database['public']['Tables']['coding_challenges']['Row'];
type CodingChallengeRow = Database['public']['Tables']['coding_challenges']['Row'];
type TestCase = Database['public']['Tables']['coding_challenge_test_cases']['Row'];
type ClientVisibleTestCase = {
    id: string;
    input: any; // Assuming input is JSONB or a type that 'any' can represent here
    explanation: string | null;
};
type UserProfile = Database['public']['Tables']['users']['Row'];
type CodingChallengeWithTestCases = CodingChallengeRow & {
    coding_challenge_test_cases: Database['public']['Tables']['coding_challenge_test_cases']['Row'][]; // Full test cases from DB
};

interface AIGeneratedChallenge {
    title: string;
    problem_statement: string; // Markdown preferred
    difficulty: 'easy' | 'medium' | 'hard';
    category: string; // e.g., arrays, strings, flutter_widgets, machine_learning_basics
    default_language: 'javascript' | 'python' | 'java' | 'dart'; // Add more as needed
    initial_code_snippet: string;
    example_test_cases: Array<{
        input: any; // JSON representation
        expected_output: any; // JSON representation
        explanation?: string;
    }>;
}

export interface FetchChallengeResult {
    success: boolean;
    challenge?: { // This is what the client component will receive
        id: string; // Can be a temporary ID if not saving, or DB ID if saved
        title: string | null;
        problem_statement: string | null;
        difficulty: string | null;
        category: string | null;
        default_language: string | null;
        initial_code_snippet: string | null;
        visible_test_cases: Array<{ input: any; explanation?: string; id?: string }>; // id is optional if generated
    };
    error?: string;
}

// --- Gemini Configuration (should be here or in a shared config) ---
const MODEL_NAME_CHALLENGE_GEN = "gemini-1.5-flash-latest"; // Or gemini-pro
const API_KEY_CHALLENGE_GEN = process.env.GOOGLE_GEMINI_API_KEY;
const genAIChallenge = API_KEY_CHALLENGE_GEN ? new GoogleGenerativeAI(API_KEY_CHALLENGE_GEN) : null;


function constructChallengeGenerationPrompt(
    userProvidedTopic: string | null,
    userProfile: UserProfile | null
): string {
    let context = "";
    let focusInstruction = "";

    if (userProvidedTopic && userProvidedTopic.trim() !== "") {
        context = `The user wants a coding challenge specifically about "${userProvidedTopic}".`;
        focusInstruction = `The challenge MUST be directly related to ${userProvidedTopic}.`;
    } else if (userProfile && userProfile.profile_complete) {
        context = "The user has not specified a topic. Generate a challenge based on their profile:\n";
        if (userProfile.primary_tech_stack) context += `- Primary Tech Stack: ${userProfile.primary_tech_stack}\n`;
        if (userProfile.programming_languages && userProfile.programming_languages.length > 0) {
            context += `- Known Languages: ${userProfile.programming_languages.join(', ')}\n`;
        }
        if (userProfile.target_roles && userProfile.target_roles.length > 0) {
            context += `- Target Roles: ${userProfile.target_roles.join(', ')}\n`;
        }
        focusInstruction = `The challenge should be relevant to this profile. If multiple languages are listed, pick one suitable for a general coding challenge (e.g., Python, JavaScript) unless the tech stack strongly implies another (e.g., Dart for Flutter stack).`;
    } else {
        context = "The user has not specified a topic and has an incomplete profile. Generate a general, beginner-to-intermediate coding challenge suitable for common software engineering interviews (e.g., involving arrays, strings, or basic algorithms).";
        focusInstruction = "This should be a widely applicable coding challenge."
    }

    return `
You are an expert technical interviewer creating a coding challenge.
${context}
${focusInstruction}

Generate ONE coding challenge with the following details:
- "title": A concise, descriptive title for the challenge (e.g., "Reverse a Linked List", "Validate Subsequence", "Flutter Counter Widget State").
- "problem_statement": A clear problem description, suitable for an interview. Use Markdown for formatting if needed (e.g., for code blocks in the description).
- "difficulty": Estimate difficulty as 'easy', 'medium', or 'hard'.
- "category": A relevant category tag (e.g., "arrays", "strings", "linked_lists", "flutter_ui", "dart_core", "machine_learning_basics", "api_design").
- "default_language": Suggest a common default language for solving this problem (e.g., 'javascript', 'python', 'java', 'dart').
- "initial_code_snippet": A basic boilerplate/starter code snippet for the default_language (e.g., function signature).
- "example_test_cases": An array of 2-3 example test cases. Each test case object should have:
    - "input": The input for the function/problem (use a JSON representation if complex, e.g., {"nums": [1,2,3], "target": 4} or simple values).
    - "expected_output": The corresponding expected output (JSON representation if complex).
    - "explanation": (Optional) A brief explanation for the test case.

The entire response MUST be a single, valid JSON object matching this structure:
{
  "title": "...",
  "problem_statement": "...",
  "difficulty": "...",
  "category": "...",
  "default_language": "...",
  "initial_code_snippet": "...",
  "example_test_cases": [
    { "input": ..., "expected_output": ..., "explanation": "..." }
  ]
}
Do not include any text outside of this JSON object.
The problem should be solvable by writing a single function or a small class.
Avoid overly complex or multi-part problems for this quick challenge format.
`;
}

// Main action to fetch or generate a challenge
export async function fetchQuickCodingChallengeAction(
    userProvidedTopic?: string | null
): Promise<FetchChallengeResult> {
    console.log("FETCH_CHALLENGE_ACTION: Initiated. User provided topic:", userProvidedTopic);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated." };

    let userProfile: UserProfile | null = null;
    if (!userProvidedTopic || userProvidedTopic.trim() === "") {
        const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).single();
        userProfile = profileData as UserProfile | null;
    }

    if (!genAIChallenge) {
        console.warn("FETCH_CHALLENGE_ACTION: Gemini SDK not initialized. Cannot generate challenge.");
        return { success: false, error: "AI service for challenge generation is unavailable." };
    }

    try {
        const prompt = constructChallengeGenerationPrompt(userProvidedTopic, userProfile);
        console.log("FETCH_CHALLENGE_ACTION: Sending prompt to Gemini for challenge generation (first 300 chars):\n", prompt.substring(0, 300) + "...");

        const model = genAIChallenge.getGenerativeModel({ model: MODEL_NAME_CHALLENGE_GEN });
        const generationConfig: GenerationConfig = { temperature: 0.7, maxOutputTokens: 2048 };
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });
        const responseText = result.response.text();
        console.log("FETCH_CHALLENGE_ACTION: Gemini Raw Response (challenge gen):\n", responseText.substring(0, 500) + "...");

        let cleanedJsonText = responseText.trim();
        if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
        else if (cleanedJsonText.startsWith('```')) cleanedJsonText = cleanedJsonText.substring(3);
        if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);

        const aiGeneratedData = JSON.parse(cleanedJsonText.trim()) as AIGeneratedChallenge;

        if (!aiGeneratedData || !aiGeneratedData.title || !aiGeneratedData.problem_statement) {
            throw new Error("AI did not return the expected challenge structure.");
        }

        // OPTIONAL: Save the AI-generated challenge to your database
        // This allows reuse and builds your question bank.
        // For simplicity in this example, we won't save it back to coding_challenges table yet,
        // but in a real app, you'd likely want to. If saving, generate a UUID for its ID.
        const challengeIdForClient = `ai-generated-${Date.now()}-${Math.random().toString(36).substring(7)}`;


        const challengeForClient: FetchChallengeResult['challenge'] = {
            id: challengeIdForClient, // Temporary ID, or DB ID if saved
            title: aiGeneratedData.title,
            problem_statement: aiGeneratedData.problem_statement,
            difficulty: aiGeneratedData.difficulty,
            category: aiGeneratedData.category,
            default_language: aiGeneratedData.default_language,
            initial_code_snippet: aiGeneratedData.initial_code_snippet,
            visible_test_cases: (aiGeneratedData.example_test_cases || []).map((tc, idx) => ({
                id: `tc-demo-${idx}`, // Temporary test case ID
                input: tc.input,
                explanation: tc.explanation
                // Expected output is kept server-side for evaluation
            })),
        };

        // Store the full challenge details (including expected outputs) temporarily
        // if you plan to evaluate against them without re-fetching from DB.
        // This could be done in server-side cache (e.g., Vercel KV) or passed carefully.
        // For now, runCodeAndEvaluateAction will need to know the expected_outputs.
        // One way is for runCodeAndEvaluateAction to also re-generate/fetch these expected outputs if needed.

        console.log("FETCH_CHALLENGE_ACTION: Successfully generated challenge for client:", challengeForClient.id);
        return { success: true, challenge: challengeForClient };

    } catch (e: any) {
        console.error("FETCH_CHALLENGE_ACTION: Error generating or parsing AI challenge:", e);
        return { success: false, error: `Failed to generate coding challenge: ${e.message}` };
    }
}


export interface RunCodePayload {
    challengeId: string;
    language: string;
    code: string;
    runAllTests?: boolean; // If true, runs against all (including hidden) test cases on server
    specificTestCaseId?: string; // To run a single specific test case
}

export interface TestCaseResult {
    testCaseId: string;
    input: any;
    expectedOutput?: any; // Only include if it's a visible test case result being sent back
    actualOutput?: string | null;
    passed: boolean;
    error?: string | null; // Compile error, runtime error
    stdout?: string | null;
    stderr?: string | null;
    executionTime?: number | null; // Milliseconds
    memory?: number | null; // KB
}

export interface RunCodeResult {
    success: boolean;
    results?: TestCaseResult[];
    submissionId?: string; // ID of the record in user_coding_challenge_submissions
    overallStatus?: 'passed' | 'failed_tests' | 'compile_error' | 'runtime_error' | 'pending';
    error?: string;
}


// MOCK FUNCTION - REPLACE THIS WITH ACTUAL SANDBOX INTEGRATION
async function executeCodeInSandbox(language: string, code: string, input: any): Promise<{ stdout: string | null; stderr: string | null; error: string | null; time: number | null; memory: number | null; status: { id: number, description: string } }> {
    console.warn(`SANDBOX_MOCK: Executing ${language} code. Input: ${JSON.stringify(input)}. THIS IS A MOCK.`);
    // --- !!! REPLACE THIS WITH ACTUAL SANDBOX API CALL (e.g., Judge0, Piston) !!! ---
    // Example: If code is trying to solve "two sum" for input: { "nums": [2, 7, 11, 15], "target": 9 }
    // and expected output is [0, 1] or [1, 0]

    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate success for simple cases for now
    if (language === 'javascript' && code.includes('return') && input && input.args) {
        // This is a very naive mock. A real sandbox runs the code.
        try {
            // DANGER: eval is evil. This is ONLY for a non-production MOCK.
            // In a real sandbox, this is isolated and secure.
            // const fn = new Function(...Object.keys(input), `return (${code})(...Object.values(input.args));`);
            // const result = fn(...input.args);
            // return { stdout: JSON.stringify(result), stderr: null, error: null, time: 100, memory: 1024, status: {id: 3, description: "Accepted"} };

            // For now, just return a placeholder that might match for a "two sum" type problem.
            if (JSON.stringify(input.args) === JSON.stringify([[2, 7, 11, 15], 9])) {
                return { stdout: JSON.stringify([0, 1]), stderr: null, error: null, time: 100, memory: 1024, status: { id: 3, description: "Accepted" } };
            }
        } catch (e: any) {
            return { stdout: null, stderr: e.message, error: "Runtime Error (Mock)", time: 50, memory: 1024, status: { id: 5, description: "Runtime Error" } };
        }
    }

    return { stdout: "Mock Output", stderr: null, error: null, time: 150, memory: 2048, status: { id: 3, description: "Accepted (Mock)" } }; // Default mock success
}
// --- END OF MOCK FUNCTION ---


export async function runCodeAndEvaluateAction(payload: RunCodePayload): Promise<RunCodeResult> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    const { challengeId, language, code, runAllTests, specificTestCaseId } = payload;

    try {
        // 1. Fetch the challenge and its test cases (server-side, so we get expected_output)
        const { data: challengeData, error: challengeError } = await supabase
            .from('coding_challenges')
            .select(`
                *,
                coding_challenge_test_cases (*)
            `)
            .eq('id', challengeId)
            .single();

        if (challengeError || !challengeData) {
            return { success: false, error: "Challenge not found." };
        }

        let testCasesToRun: TestCase[] = [];
        if (runAllTests) {
            testCasesToRun = challengeData.coding_challenge_test_cases || [];
        } else if (specificTestCaseId) {
            testCasesToRun = (challengeData.coding_challenge_test_cases || []).filter(tc => tc.id === specificTestCaseId && !tc.is_hidden);
        } else { // Default: run only visible test cases (usually when user clicks "Run Code")
            testCasesToRun = (challengeData.coding_challenge_test_cases || []).filter(tc => !tc.is_hidden);
        }

        if (testCasesToRun.length === 0) {
            return { success: false, error: "No test cases found to run for this configuration." };
        }

        const results: TestCaseResult[] = [];
        let overallStatus: RunCodeResult['overallStatus'] = 'passed';

        for (const tc of testCasesToRun) {
            const sandboxResult = await executeCodeInSandbox(language, code, tc.input);

            let passed = false;
            // Naive comparison for JSONB expected_output. Needs robust deep comparison.
            // Consider normalizing whitespace, order of keys in objects if not arrays.
            try {
                // Attempt to parse both, then deep compare if objects/arrays
                const actual = sandboxResult.stdout ? JSON.parse(sandboxResult.stdout) : null;
                const expected = tc.expected_output ? (tc.expected_output as any) : null; // Assume expected_output is already parsed JSON from DB

                if (sandboxResult.status.description === "Accepted" && !sandboxResult.error && !sandboxResult.stderr) {
                    // Simple comparison for now. For arrays, order might matter.
                    passed = JSON.stringify(actual) === JSON.stringify(expected);
                }

            } catch (e) {
                console.warn("Comparison error or non-JSON output/expected:", e);
                passed = false; // If parsing fails, mark as failed
            }


            const testResult: TestCaseResult = {
                testCaseId: tc.id,
                input: tc.input,
                expectedOutput: runAllTests || !tc.is_hidden ? tc.expected_output : undefined, // Only show expected for visible or all tests run
                actualOutput: sandboxResult.stdout,
                passed: passed,
                error: sandboxResult.error || sandboxResult.stderr, // Combine sandbox errors
                stdout: sandboxResult.stdout,
                stderr: sandboxResult.stderr,
                executionTime: sandboxResult.time,
                memory: sandboxResult.memory,
            };
            results.push(testResult);

            if (!passed) {
                overallStatus = 'failed_tests';
                if (sandboxResult.status.description !== "Accepted") {
                    if (sandboxResult.status.description.toLowerCase().includes("compile")) overallStatus = 'compile_error';
                    else if (sandboxResult.status.description.toLowerCase().includes("runtime")) overallStatus = 'runtime_error';
                }
            }
        }

        // 2. Store the submission (even if it failed tests)
        const { data: submissionData, error: submissionError } = await supabase
            .from('user_coding_challenge_submissions').insert({
                user_id: user.id,
                challenge_id: challengeId,
                language: language,
                code_submission: code,
                status: overallStatus, // Overall status after running all specified tests
                test_case_results: results, // Store all individual test case results
            })
            .select('id')
            .single();

        if (submissionError) {
            console.error("Error storing code submission:", submissionError);
            // Don't necessarily fail the whole operation if results can still be shown
            return { success: true, results, overallStatus, error: "Failed to store submission, but tests were run." };
        }

        return { success: true, results, submissionId: submissionData?.id, overallStatus };

    } catch (e: any) {
        console.error("Unexpected error running code:", e);
        return { success: false, error: "An unexpected error occurred while running your code." };
    }
}