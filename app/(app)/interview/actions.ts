// app/(app)/interview/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/database.types';
// DO NOT import redirect from next/navigation here if not used.
// import { redirect } from 'next/navigation'; // For potential redirects from actions

// Import Google Generative AI
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig } from "@google/generative-ai";
import { redirect } from 'next/navigation';

export interface CreateInterviewFormState {
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>; // For field-specific errors
    sessionId?: string;
    success: boolean;
}

export interface EndSessionEarlyResult {
    success: boolean;
    error?: string;
    message?: string;
}

type UserProfile = Database['public']['Tables']['users']['Row'];
type QuestionInsert = Database['public']['Tables']['interview_questions']['Insert'];
type SessionWithProfileAndQuestions = Database['public']['Tables']['interview_sessions']['Row'] & {
    users: UserProfile | null;
    interview_questions: Database['public']['Tables']['interview_questions']['Row'][];
};

const MODEL_NAME = "gemini-1.5-flash-latest"; // Or another suitable model like gemini-1.5-flash-latest
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("GOOGLE_GEMINI_API_KEY is not set. AI features will be disabled or use placeholders.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Helper function to construct a detailed prompt
function constructPrompt(topic: string | null, userProfile: UserProfile | null, numberOfQuestions: number): string {
    let prompt = `You are an expert interviewer. Generate ${numberOfQuestions} interview questions suitable for a practice session.
    Ensure at least one question is a practical coding question or a conceptual question requiring code examples, if the topic or profile allows.
    If generating a coding question, specify its "question_type" as "coding_exercise" or "technical_coding_concept".
    The coding question should be solvable within a typical interview timeframe (e.g., 15-30 minutes of thought and coding).
    It can be a small algorithm, data structure manipulation, or a problem related to a specific technology if indicated by the profile or topic.
    For coding questions, provide only the problem statement. Do not provide the solution or hints in the question_text.

    `; // Added a newline for clarity

    if (topic && topic.trim() !== "") {
        prompt += `The interview topic is "${topic}". `;
        if (topic.toLowerCase().includes("data structures") || topic.toLowerCase().includes("dsa")) {
            prompt += `Focus heavily on data structures and algorithms questions, including coding exercises related to them. `;
        } else if (topic.toLowerCase().includes("system design")) {
            prompt += `Focus on system design principles, trade-offs, and designing scalable systems. `;
        }
    } else {
        prompt += "The interview is for general tech practice. ";
    }

    if (userProfile && userProfile.profile_complete) {
        prompt += "Consider the following candidate profile for tailoring the questions:\n";
        if (userProfile.years_of_experience) {
            prompt += `- Years of Experience: ${userProfile.years_of_experience}\n`;
        }
        if (userProfile.primary_tech_stack) {
            prompt += `- Primary Tech Stack: ${userProfile.primary_tech_stack}\n`;
        }
        if (userProfile.programming_languages && userProfile.programming_languages.length > 0) {
            prompt += `- Programming Languages: ${userProfile.programming_languages.join(', ')} (Consider these for coding questions if applicable)\n`;
        }
        if (userProfile.technologies && userProfile.technologies.length > 0) {
            prompt += `- Technologies/Frameworks: ${userProfile.technologies.join(', ')}\n`;
        }
        if (userProfile.target_roles && userProfile.target_roles.length > 0) {
            prompt += `- Target Roles: ${userProfile.target_roles.join(', ')}\n`;
        }
        prompt += "\n";
    } else {
        prompt += "The candidate has not provided detailed profile information, so lean towards more general questions related to the topic if provided, or general tech questions otherwise. Still try to include one general coding question.\n";
    }

    if (topic && (topic.toLowerCase().includes("data structures") || topic.toLowerCase().includes("coding") || topic.toLowerCase().includes("dsa"))) {
        prompt += `Ensure at least two questions are practical coding exercises related to ${topic}. `
    } else {
        prompt += `Ensure at least one question is a practical coding question or a conceptual question requiring code examples, if the topic or profile allows. `
    }

    prompt += `The questions should cover a mix of types.
    Question types can include: behavioral, technical_problem_solving, system_design, coding_exercise, technical_coding_concept, domain_specific_knowledge, situational.
    
    Format the output as a JSON array of objects, where each object has "question_text" and "question_type" keys.
    Example for a coding question:
    {"question_text": "Given an array of integers, write a function to find the pair of numbers that sum up to a specific target. What is its time complexity?", "question_type": "coding_exercise"}
    
    Generate exactly ${numberOfQuestions} questions. Ensure the output is valid JSON.`;

    return prompt;
}

async function generateQuestionsFromAI(
    topic: string | null,
    userProfile: UserProfile | null,
    numberOfQuestions: number = 5
): Promise<Array<{ question_text: string; question_type: string }>> {
    console.log("Attempting to generate AI questions for topic:", topic, "and user profile:", userProfile ? "provided" : "not provided");

    if (!genAI) {
        console.warn("Google Generative AI SDK not initialized due to missing API key. Returning generic questions.");
        // Fallback to generic questions if API key is missing
        const genericQuestions = [
            { question_text: "Tell me about yourself. (Fallback)", question_type: "behavioral" },
            { question_text: "What are your strengths? (Fallback)", question_type: "behavioral" },
            { question_text: "Why are you interested in this type of role? (Fallback)", question_type: "behavioral" },
            { question_text: "Describe a challenging project you worked on. (Fallback)", question_type: "technical_experience" },
            { question_text: "Where do you see yourself in 5 years? (Fallback)", question_type: "career_goals" },
        ];
        return genericQuestions.slice(0, numberOfQuestions);
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = constructPrompt(topic, userProfile, numberOfQuestions);

    console.log("Generated Prompt for Gemini:\n", prompt);

    const generationConfig: GenerationConfig = {
        temperature: 0.7, // Adjust for creativity vs. predictability
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048, // Adjust based on expected response size
        // responseMimeType: "application/json", // Use this if your model version supports it directly
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });

        const response = result.response;
        const responseText = response.text();
        console.log("Gemini Raw Response Text:\n", responseText);

        // Attempt to parse the JSON from the response text
        // Gemini might sometimes add backticks or "json" prefix around the JSON block.
        let cleanedJsonText = responseText.trim();
        if (cleanedJsonText.startsWith('```json')) {
            cleanedJsonText = cleanedJsonText.substring(7);
        } else if (cleanedJsonText.startsWith('```')) {
            cleanedJsonText = cleanedJsonText.substring(3);
        }
        if (cleanedJsonText.endsWith('```')) {
            cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
        }
        cleanedJsonText = cleanedJsonText.trim();


        const generatedArray = JSON.parse(cleanedJsonText) as Array<{ question_text: string; question_type: string }>;

        if (!Array.isArray(generatedArray) || generatedArray.length === 0) {
            console.error("AI did not return a valid array or returned an empty array.");
            throw new Error("AI response was not a valid array of questions.");
        }
        // Ensure we only return the requested number of questions, even if AI gives more/less.
        return generatedArray.slice(0, numberOfQuestions);

    } catch (error) {
        console.error("Error generating questions from AI:", error);
        // Fallback to generic questions on error
        const genericQuestionsOnError = [
            { question_text: "Describe a situation where you had to learn a new technology quickly. (Error Fallback)", question_type: "learning_agility" },
            { question_text: "What is a common misconception about [relevant tech from profile/topic, or 'your field']? (Error Fallback)", question_type: "technical_insight" },
        ];
        // You might want a more robust fallback strategy
        return genericQuestionsOnError.slice(0, numberOfQuestions);
    }
}

// New Server Action to specifically generate and insert questions
export async function generateAndInsertQuestionsAction(sessionId: string): Promise<{ success: boolean; error?: string; questions?: Database['public']['Tables']['interview_questions']['Row'][] }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    const { data: session, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('id, topic, user_id, users (*)')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

    if (sessionError || !session) {
        console.error("generateAndInsertQuestionsAction: Session not found or access denied.", sessionError);
        return { success: false, error: 'Session not found or access denied.' };
    }
    // Ensure session.users is not null before casting.
    // The select('users (*)') should populate it if a user record exists and is linked.
    if (!session.users) {
        console.warn("generateAndInsertQuestionsAction: User profile (users table) not joined or found for session. Proceeding with potentially less tailored questions.", session);
        // We can still proceed, generateQuestionsFromAI handles null userProfile by generating generic questions.
    }

    const userProfile = session.users as UserProfile | null; // Cast to UserProfile or null
    const generatedQuestionsData = await generateQuestionsFromAI(session.topic, userProfile);

    if (!generatedQuestionsData || generatedQuestionsData.length === 0) {
        console.error("No questions were generated by AI or fallback.");
        return { success: false, error: "Failed to generate any questions." };
    }

    const questionsToInsert: QuestionInsert[] = generatedQuestionsData.map((q, index) => ({
        session_id: sessionId,
        question_text: q.question_text,
        question_type: q.question_type || "general", // Default type if AI misses it
        order_index: index + 1,
    }));

    if (questionsToInsert.length > 0) {
        console.log(`Inserting ${questionsToInsert.length} questions for session ${sessionId}`);
        const { data: insertedQuestions, error: insertError } = await supabase
            .from('interview_questions')
            .insert(questionsToInsert)
            .select();

        if (insertError) {
            console.error("Error inserting generated questions (in action):", insertError);
            // This could be an RLS issue on interview_questions if not resolved
            return { success: false, error: `Failed to insert questions: ${insertError.message}` };
        }

        revalidatePath(`/interview/${sessionId}`);
        console.log("Questions inserted and path revalidated.");
        return { success: true, questions: insertedQuestions || [] };
    }
    return { success: true, questions: [] };
}


// Modified function to primarily fetch data
export async function getInterviewData(sessionId: string): Promise<{
    session: SessionWithProfileAndQuestions | null;
    error?: string | null;
}> {
    // ... (this function remains largely the same)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { session: null, error: 'User not authenticated' };
    }

    const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select(`
            *,
            users (*),
            interview_questions (*)
        `)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (sessionError) {
        console.error("Error fetching session data:", sessionError);
        return { session: null, error: `Failed to fetch session: ${sessionError.message}` };
    }
    if (!sessionData) {
        return { session: null, error: 'Session not found or access denied' };
    }

    if (sessionData.interview_questions) {
        sessionData.interview_questions.sort((a, b) => a.order_index - b.order_index);
    }

    return { session: sessionData as SessionWithProfileAndQuestions, error: null };
}

type QuestionRow = Database['public']['Tables']['interview_questions']['Row'];
type AnswerRow = Database['public']['Tables']['user_answers']['Row'];
type AIAnalysisInsert = Database['public']['Tables']['ai_analysis_results']['Insert'];

interface QuestionWithAnswer {
    question_id: string;
    question_text: string;
    question_type: string;
    user_answer_text: string | null; // Answer might be missing if user skipped
    user_answer_db_id: string | null; // To link analysis back to user_answers.id
}

async function getSessionDataForAnalysis(sessionId: string, userId: string): Promise<{
    sessionTopic: string | null;
    userProfile: UserProfile | null;
    questionsWithAnswers: QuestionWithAnswer[];
    error?: string;
}> {
    const supabase = createClient();

    const { data: sessionData, error: sessionFetchError } = await supabase
        .from('interview_sessions')
        .select(`
            topic,
            users (*),
            interview_questions (
                id,
                question_text,
                question_type,
                user_answers (
                    id,
                    answer_text
                )
            )
        `)
        .eq('id', sessionId)
        .eq('user_id', userId) // Ensure user owns this session
        .single();

    if (sessionFetchError || !sessionData) {
        console.error("Error fetching session data for analysis:", sessionFetchError);
        return { sessionTopic: null, userProfile: null, questionsWithAnswers: [], error: "Could not fetch session data." };
    }

    const questionsWithAnswers: QuestionWithAnswer[] = (sessionData.interview_questions || []).map(q => {
        // Supabase join for one-to-one (question to user's answer for that question) might return an array

        let userAnswer: { id: string; answer_text: string | null } | null = null;

        if (q.user_answers) {
            // If Supabase types it as an array (even if it usually contains 0 or 1 item due to your logic/RLS)
            if (Array.isArray(q.user_answers)) {
                userAnswer = q.user_answers.length > 0 ? q.user_answers[0] : null;
            }
            // If Supabase types it directly as the object (or null if no join)
            // This path is taken if TypeScript infers q.user_answers is NOT an array
            else if (typeof q.user_answers === 'object' && q.user_answers !== null) {
                // We assume q.user_answers is the single answer object
                userAnswer = q.user_answers as { id: string; answer_text: string | null }; // Type assertion might be needed
            }
        }
        return {
            question_id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            user_answer_text: userAnswer?.answer_text || null,
            user_answer_db_id: userAnswer?.id || null,
        };
    });

    return {
        sessionTopic: sessionData.topic,
        userProfile: sessionData.users as UserProfile | null,
        questionsWithAnswers,
    };
}


// --- New Function: Construct prompt for AI analysis ---
function constructAnalysisPrompt(
    sessionTopic: string | null,
    userProfile: UserProfile | null,
    questionsWithAnswers: QuestionWithAnswer[]
): string {
    let prompt = `You are an expert interview coach providing feedback on a practice interview session.
The candidate has just completed a session. Below are the questions asked (each with a unique "INTERNAL_QUESTION_UUID") and the candidate's answers.
Provide an overall summary of the performance, then for each question where an answer was provided, give:
1. A brief evaluation of the answer.
2. Specific, actionable suggestions for improvement.
3. Highlight good points or strengths in the answer.

Session Topic: ${sessionTopic || "General Tech Practice"}
`;

    if (userProfile && userProfile.profile_complete) {
        prompt += "\nCandidate Profile (for context):\n";
        if (userProfile.primary_tech_stack) prompt += `- Tech Stack: ${userProfile.primary_tech_stack}\n`;
        if (userProfile.years_of_experience) prompt += `- Experience: ${userProfile.years_of_experience} years\n`;
        if (userProfile.target_roles && userProfile.target_roles.length > 0) prompt += `- Target Roles: ${userProfile.target_roles.join(', ')}\n`;
    }

    prompt += "\n--- Interview Transcript ---\n";
    questionsWithAnswers.forEach((qa, index) => {
        // Make the INTERNAL_QUESTION_UUID very clear and ask AI to use this exact value
        prompt += `\nINTERNAL_QUESTION_UUID: ${qa.question_id}\n`; // Present ID clearly
        prompt += `Question ${index + 1} (Type: ${qa.question_type}): ${qa.question_text}\n`;
        if (qa.user_answer_text) {
            prompt += `Candidate's Answer: ${qa.user_answer_text}\n`;
        } else {
            prompt += `Candidate's Answer: (No answer provided)\n`;
        }
    });

    prompt += `\n--- End of Transcript ---\n
Please structure your feedback clearly.
For the overall feedback, provide a summary, strengths, and areas for improvement.
For each question-answer pair, provide the feedback within an "evaluation" object.

Format the entire output as a single valid JSON object.
The main JSON object should have a key "overall_feedback" (with "summary", "strengths", "areas_for_improvement" sub-keys)
and a key "question_feedback" which is an array of objects.

Each object in the "question_feedback" array MUST correspond to a question from the transcript and MUST include:
1. "question_id": This MUST be the exact "INTERNAL_QUESTION_UUID" value provided for that question in the transcript above. Do not create a new ID or use the question type. Use the provided UUID.
2. "question_text": (The original question text from the transcript)
3. "user_answer_text": (The user's answer text from the transcript, or null if no answer was provided)
4. "evaluation": {
    "rating": "A brief qualitative rating (e.g., Excellent, Good, Needs Improvement, Fair, Poor)",
    "good_points": ["A bullet point of what was done well.", "Another good point."],
    "suggestions": ["A specific suggestion for improvement.", "Another suggestion."]
   }

Example of ONE item in the "question_feedback" array:
{
    "question_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // The exact INTERNAL_QUESTION_UUID from the transcript
    "question_text": "Tell me about yourself.",
    "user_answer_text": "User's actual answer here...",
    "evaluation": {
      "rating": "Good",
      "good_points": ["Clear introduction.", "Mentioned relevant skills."],
      "suggestions": ["Quantify achievements more.", "Tailor more to the target role if known."]
    }
}

Ensure the "question_feedback" is an array of such objects.
Provide feedback even if some answers are missing or brief.
`;
    return prompt;
}


// --- New Server Action: Trigger and store AI analysis ---
export async function analyzeInterviewSessionAction(sessionId: string): Promise<{ success: boolean; error?: string; analysisId?: string }> {
    console.log(`Starting analysis for session: ${sessionId}`);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    // 1. Fetch all necessary data for analysis
    const { sessionTopic, userProfile, questionsWithAnswers, error: dataError } = await getSessionDataForAnalysis(sessionId, user.id);

    if (dataError) {
        return { success: false, error: dataError };
    }
    if (questionsWithAnswers.length === 0) {
        return { success: false, error: "No questions found in this session to analyze." };
    }

    // Check if analysis already exists for any answer in this session to prevent re-analysis (optional, simple check)
    // A more robust check might be on the session itself having an analysis_id or status.
    const firstAnswerWithDbId = questionsWithAnswers.find(qa => qa.user_answer_db_id);
    if (firstAnswerWithDbId && firstAnswerWithDbId.user_answer_db_id) {
        const { data: existingAnalysis, error: checkError } = await supabase
            .from('ai_analysis_results')
            .select('id')
            .eq('user_answer_id', firstAnswerWithDbId.user_answer_db_id) // Check one answer
            .maybeSingle();
        if (checkError) console.error("Error checking existing analysis:", checkError);
        if (existingAnalysis) {
            console.log(`Analysis already exists for an answer in session ${sessionId}. Skipping.`);
            // You might want to return the existing analysis ID or just a success message.
            // For simplicity, we'll consider it "done". A proper system would link analysis to session.
            return { success: true, error: "Analysis already exists for this session." };
        }
    }


    // 2. Construct the prompt for Gemini
    const analysisPrompt = constructAnalysisPrompt(sessionTopic, userProfile, questionsWithAnswers);
    console.log("Analysis Prompt for Gemini:\n", analysisPrompt.substring(0, 500) + "..."); // Log a snippet

    if (!genAI) {
        console.warn("Google Generative AI SDK not initialized. Cannot perform analysis.");
        return { success: false, error: "AI service not available." };
    }

    // 3. Call Gemini API
    const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Use your configured MODEL_NAME
    const generationConfig: GenerationConfig = {
        temperature: 0.5, // Less creative for analysis
        maxOutputTokens: 4096, // Allow for detailed feedback
        // responseMimeType: "application/json", // Ideal if supported
    };
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    let analysisJsonResult: any;
    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
            generationConfig,
            safetySettings,
        });
        const responseText = result.response.text();
        console.log("Gemini Analysis Raw Response Text (snippet):\n", responseText.substring(0, 500) + "...");

        let cleanedJsonText = responseText.trim();
        if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
        else if (cleanedJsonText.startsWith('```')) cleanedJsonText = cleanedJsonText.substring(3);
        if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);

        analysisJsonResult = JSON.parse(cleanedJsonText.trim());

        if (!analysisJsonResult || typeof analysisJsonResult !== 'object') {
            throw new Error("AI analysis response was not a valid JSON object.");
        }

    } catch (e: any) {
        console.error("Error getting or parsing AI analysis:", e);
        return { success: false, error: `AI analysis failed: ${e.message}` };
    }

    // 4. Store Analysis Results
    // The AI result gives overall feedback and per-question feedback.
    // We need to link per-question feedback to user_answers.id if possible.
    // For now, let's assume the AI provides a single comprehensive analysis text
    // and we store it linked to the first user_answer record for simplicity,
    // or you might create a new table `session_analysis` linked to `interview_sessions.id`.

    // For this example, we'll create one ai_analysis_results record per user_answer that HAS an answer.
    // This requires the AI to return an array where each item can be linked.
    // The prompt asks for question_id in the response.

    const analysisRecordsToInsert: AIAnalysisInsert[] = [];
    console.log("Parsed Gemini Analysis JSON Result:", JSON.stringify(analysisJsonResult, null, 2)); // Check this output carefully


    if (analysisJsonResult.question_feedback && Array.isArray(analysisJsonResult.question_feedback)) {
        console.log(`Found ${analysisJsonResult.question_feedback.length} feedback items from AI.`);
        for (const fb of analysisJsonResult.question_feedback) { // fb is one feedback item from AI
            console.log("Processing AI feedback item:", JSON.stringify(fb, null, 2));
            if (!fb.question_id) { // Check if AI returned question_id
                console.warn("AI feedback item missing question_id, cannot link:", fb);
                continue;
            }

            // qa is one item from your database (question + its answer details)
            const originalQuestionAnswer = questionsWithAnswers.find(qa => qa.question_id === fb.question_id);

            console.log(`Matching AI question_id ${fb.question_id}: Found originalQuestionAnswer in DB data: ${originalQuestionAnswer ? 'Yes' : 'No'}`);

            if (originalQuestionAnswer) {
                console.log(`   Original DB question_id: ${originalQuestionAnswer.question_id}, AI returned question_id: ${fb.question_id}`);
                console.log(`   Original DB user_answer_db_id: ${originalQuestionAnswer.user_answer_db_id}`);
            }

            // Condition to add to analysisRecordsToInsert:
            if (originalQuestionAnswer && originalQuestionAnswer.user_answer_db_id) {
                console.log(`   -> ADDING to analysisRecordsToInsert for user_answer_db_id: ${originalQuestionAnswer.user_answer_db_id}`);
                analysisRecordsToInsert.push({
                    user_answer_id: originalQuestionAnswer.user_answer_db_id,
                    analysis_text: JSON.stringify(fb.evaluation),
                    rating: fb.evaluation?.rating || null,
                    suggestions: Array.isArray(fb.evaluation?.suggestions) ? fb.evaluation.suggestions.join('\n- ') : null,
                    good_points: Array.isArray(fb.evaluation?.good_points) ? fb.evaluation.good_points.join('\n- ') : null,
                });
            } else {
                console.warn(`   -> SKIPPING analysis storage for AI question_id ${fb.question_id}.`);
                if (!originalQuestionAnswer) {
                    console.warn(`      Reason: No matching question found in 'questionsWithAnswers' array for AI's question_id.`);
                } else if (!originalQuestionAnswer.user_answer_db_id) {
                    console.warn(`      Reason: Matching question found, but user did not answer it (user_answer_db_id is null/undefined).`);
                }
            }
        }
    } else {
        console.warn("AI response did not contain 'question_feedback' or it was not an array.");
    }

    console.log(`Final analysisRecordsToInsert count: ${analysisRecordsToInsert.length}`);

    // If you also want to store overall feedback, you'd typically add a column to `interview_sessions`
    // like `overall_analysis JSONB` and update that session record.
    // Storing overall feedback (if you added the column to interview_sessions)
    if (analysisJsonResult.overall_feedback) {
        console.log("Storing overall feedback for session:", sessionId);
        const { error: updateSessionError } = await supabase
            .from('interview_sessions')
            .update({
                // YOU NEED TO ADD THIS COLUMN TO YOUR 'interview_sessions' TABLE
                // overall_analysis: analysisJsonResult.overall_feedback, // e.g., overall_analysis JSONB
                status: 'analyzed', // Update session status regardless
                overall_analysis: analysisJsonResult.overall_feedback
            })
            .eq('id', sessionId);
        if (updateSessionError) {
            console.error("Error updating session with overall analysis/status:", updateSessionError);
            // Don't let this block storing per-question analysis if that succeeded
        } else {
            console.log("Session status updated to 'analyzed' and overall feedback stored (if column exists).");
        }
    }


    if (analysisRecordsToInsert.length > 0) {
        const { error: insertAnalysisError } = await supabase
            .from('ai_analysis_results')
            .insert(analysisRecordsToInsert).select();

        if (insertAnalysisError) {
            console.error("Error inserting AI analysis results:", insertAnalysisError);
            return { success: false, error: `Failed to store AI analysis: ${insertAnalysisError.message}` };
        }
        console.log(`${analysisRecordsToInsert.length} analysis records inserted for session ${sessionId}.`);
    } else if (!analysisJsonResult.overall_feedback) { // Only an error if no per-question AND no overall
        return { success: false, error: "AI generated no actionable feedback to store." };
    }


    revalidatePath(`/interview/${sessionId}`); // Or a dedicated review page
    revalidatePath(`/dashboard`); // So dashboard might show "Analyzed" status
    return { success: true, /* analysisId: some_main_analysis_id_if_applicable */ };
}

export async function getInProgressSessionsForUser(userId: string): Promise<Database['public']['Tables']['interview_sessions']['Row'][]> {
    const supabase = createClient(); // Server client
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    // First, mark overly old "in_progress" sessions as "completed" (or "abandoned")
    // This is a good place to do such cleanup, though a scheduled function is more robust for this.
    const { error: updateError } = await supabase
        .from('interview_sessions')
        .update({ status: 'completed', completed_at: new Date().toISOString() }) // Or a new status like 'abandoned'
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .lt('started_at', threeHoursAgo);

    if (updateError) {
        console.error("Error auto-completing old sessions:", updateError.message);
        // Non-critical, proceed to fetch current in-progress sessions
    }

    // Now fetch the truly in-progress sessions
    const { data: sessions, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false }); // Show most recent first

    if (error) {
        console.error("Error fetching in-progress sessions:", error.message);
        return [];
    }
    return sessions || [];
}

export async function startNewInterviewAction(
    prevState: CreateInterviewFormState | undefined,
    formData: FormData
): Promise<CreateInterviewFormState> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    // --- Check Daily Session Limit ---
    const SESSIONS_PER_DAY_LIMIT = 3;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (local timezone of the server)
    // For UTC-based day: const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const { count, error: countError } = await supabase
        .from('interview_sessions')
        .select('*', { count: 'exact', head: true }) // Use head:true to only get the count
        .eq('user_id', user.id)
        .gte('started_at', today.toISOString()); // Sessions started on or after the beginning of today

    if (countError) {
        console.error("Error counting user's daily sessions:", countError);
        return { success: false, error: "Could not verify session limit. Please try again." };
    }

    if (count !== null && count >= SESSIONS_PER_DAY_LIMIT) {
        console.log(`User ${user.id} has reached daily limit of ${SESSIONS_PER_DAY_LIMIT} sessions. Count: ${count}`);
        return {
            success: false,
            error: `You have reached your daily limit of ${SESSIONS_PER_DAY_LIMIT} interview sessions. Please try again tomorrow.`
        };
    }
    console.log(`User ${user.id} daily session count: ${count} (Limit: ${SESSIONS_PER_DAY_LIMIT})`);
    // --- End Check Daily Session Limit ---

    const topic = (formData.get('topic') as string)?.trim() || 'General Tech Practice';
    console.log("Action: Starting new interview with topic:", topic);

    const { data: newSession, error: dbError } = await supabase
        .from('interview_sessions')
        .insert({
            user_id: user.id,
            topic: topic,
            status: 'in_progress',
            // started_at is default now()
        })
        .select('id')
        .single();

    if (dbError) {
        console.error("DB Error in startNewInterviewAction:", dbError);
        return { success: false, error: dbError.message, message: "Database error occurred." };
    }

    if (newSession) {
        return { success: true, sessionId: newSession.id, message: "Interview session created!" };
    }

    return { success: false, error: "Could not create session.", message: "An unknown error occurred." };
}

export async function endInterviewSessionEarlyAction(sessionId: string): Promise<EndSessionEarlyResult> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        const { data: session, error: fetchError } = await supabase
            .from('interview_sessions')
            .select('status')
            .eq('id', sessionId)
            .eq('user_id', user.id) // Ensure user owns the session
            .single();

        if (fetchError) {
            console.error(`Error fetching session ${sessionId} to end early:`, fetchError);
            return { success: false, error: "Could not find the session or you don't have permission." };
        }

        if (session.status !== 'in_progress') {
            // Optionally allow ending 'analyzed' or 'completed' sessions again,
            // or just return success if it's already not in_progress.
            console.log(`Session ${sessionId} is already not in_progress (status: ${session.status}). No action taken or marking as completed again.`);
            // To be safe, let's update completed_at if it's already completed but they hit leave.
            // Or just return success.
        }

        const { error: updateError } = await supabase
            .from('interview_sessions')
            .update({
                status: 'completed', // Or 'abandoned', 'terminated_early' if you want a distinct status
                completed_at: new Date().toISOString(),
            })
            .eq('id', sessionId)
            .eq('user_id', user.id); // Double-check ownership on update

        if (updateError) {
            console.error(`Error updating session ${sessionId} status to completed (early end):`, updateError);
            return { success: false, error: `Failed to end session: ${updateError.message}` };
        }

        console.log(`Session ${sessionId} marked as completed (ended early) by user ${user.id}.`);
        revalidatePath('/dashboard'); // To update session list on dashboard
        revalidatePath(`/interview/${sessionId}`); // To update current page if user somehow stays
        revalidatePath(`/interview/${sessionId}/review`); // If a review page might exist

        return { success: true, message: "Interview session ended." };

    } catch (e: any) {
        console.error("Unexpected error in endInterviewSessionEarlyAction:", e);
        return { success: false, error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function getUserDailySessionCount(): Promise<{count: number | null, error?: string}> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { count: null, error: "User not authenticated" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
        .from('interview_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('started_at', today.toISOString());

    if (error) {
        console.error("Error in getUserDailySessionCount:", error);
        return { count: null, error: error.message };
    }
    return { count };
}