// app/api/demo-feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig } from "@google/generative-ai";
import { Ratelimit } from "@upstash/ratelimit"; // For rate limiting
import { kv } from "@vercel/kv"; // For storing rate limit counts with Vercel KV
import { createClient } from '@/lib/supabase/server';

// --- Gemini Configuration ---
const MODEL_NAME = "gemini-1.5-flash-latest"; // Use a fast and cost-effective model for demo
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const DEMO_ROUTE_IDENTIFIER = '/api/demo-feedback';
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60; // per 10 minutes (600 seconds)


if (!API_KEY) {
    console.error("CRITICAL: GOOGLE_GEMINI_API_KEY is not set for demo feedback API.");
}
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// --- Rate Limiting Configuration (using Upstash Ratelimit & Vercel KV) ---
// Allow 5 requests per 10 minutes from the same IP for the demo. Adjust as needed.
// You need to have Vercel KV set up in your project.
let ratelimit: Ratelimit | null = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN && process.env.KV_REST_API_READ_ONLY_TOKEN) {
    ratelimit = new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 requests per 10 minutes
        analytics: true,
        prefix: "@upstash/ratelimit/demo_feedback",
    });
} else {
    console.warn("Vercel KV environment variables not set. Rate limiting for demo feedback API will be disabled.");
}


function constructDemoFeedbackPrompt(questionText: string, userAnswerText: string): string {
    return `You are an interview coach. The user was asked the following interview question:
Question: "${questionText}"

The user provided this answer:
Answer: "${userAnswerText}"

Please provide brief, constructive feedback on the user's answer. Focus on:
1. Clarity and conciseness of the answer.
2. Relevance to the question.
3. One key strength.
4. One specific area for improvement.

Keep the feedback concise, suitable for a quick demo.
Format your feedback as a JSON object with keys "strength", "improvement", and "overall_comment".
Example:
{
  "strength": "Good use of a specific example to illustrate your point.",
  "improvement": "Consider quantifying the impact of your actions in the example.",
  "overall_comment": "A solid answer, focusing on quantifying results would make it even stronger."
}
Ensure the output is valid JSON.`;
}


export async function POST(request: NextRequest) {
    if (!genAI) {
        return NextResponse.json({ error: "AI service is currently unavailable." }, { status: 503 });
    }

    // --- Correct way to get IP Address in Vercel deployments ---
    const ip = request.headers.get('x-forwarded-for') || // Standard header for reverse proxies
               request.headers.get('x-real-ip') || // Common alternative
               "127.0.0.1"; // Default if no IP found

    // Initialize Supabase client within the handler
    // If using Supabase Auth Helpers with Route Handlers:
    const supabase = createClient(); // Initialize Supabase server client
    // Or if using your custom server client:
    // import { createClient } from '@/lib/supabase/server'; // (This needs cookie store in Route Handler)
    // For route handlers, it's often easier to create a generic service_role client if no user auth is needed for THIS operation
    // OR pass cookies if your server client factory supports it.
    // For simplicity, if your createClient in server.ts doesn't take cookies,
    // you might need a specific Supabase client instance here for database access.
    // Let's assume for now you have a way to get a Supabase client instance that can query.
    // If this is an unauthenticated route and you just need DB access, service_role key might be an option for this specific client.
    // However, for rate limiting per IP, you don't need an *authenticated* user for Supabase.

    // A more direct way if not using auth helpers and just need a db client:
    // import { createClient as createSupabaseClient } from '@supabase/supabase-js';
    // const supabaseDB = createSupabaseClient(
    //    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for backend operations like this if appropriate
    // );
    // For this specific rate limiting, even anon key might work if RLS allows inserts to api_request_logs by anon,
    // but service_role is safer for backend tasks. Let's stick to the auth-helpers or your server client.
    // The createClient() from server.ts might need to be adapted or a new one created for Route Handlers
    // if it strictly expects being in a Server Component context with cookies().

    // --- Implement Supabase Rate Limiting ---
    try {
        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();

        const { count, error: countError } = await supabase // Use the initialized Supabase client
            .from('api_request_logs')
            .select('*', { count: 'exact', head: true })
            .eq('ip_address', ip)
            .eq('route', DEMO_ROUTE_IDENTIFIER)
            .gte('created_at', windowStart);

        if (countError) {
            console.error(`Rate limit check error for IP ${ip}:`, countError);
            // Decide on fail-open or fail-closed policy
            // For a demo, you might fail open with a log, but for production, consider 500 or denying.
            console.warn(`Proceeding for IP ${ip} without rate limit check due to DB error.`);
        } else if (count !== null && count >= RATE_LIMIT_MAX_REQUESTS) {
            console.log(`Rate limit EXCEEDED for IP ${ip} on route ${DEMO_ROUTE_IDENTIFIER}. Count: ${count}`);
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429, headers: { 'Retry-After': RATE_LIMIT_WINDOW_SECONDS.toString() } } // Inform client when to retry
            );
        }

        // Log the current request *after* the check passes
        const { error: logError } = await supabase
            .from('api_request_logs')
            .insert({ ip_address: ip, route: DEMO_ROUTE_IDENTIFIER });

        if (logError) {
            console.error(`Rate limit LOGGING error for IP ${ip}:`, logError);
            // This is non-critical for processing the user's request but good to know.
        }
        console.log(`Rate limit check PASSED for IP ${ip}. Current count in window (before this req): ${count}`);

    } catch (e) {
        console.error(`Unexpected error during rate limit processing for IP ${ip}:`, e);
        console.warn(`Proceeding for IP ${ip} without rate limit enforcement due to unexpected error.`);
    }
    // --- End Supabase Rate Limiting ---

    try {
        const { question, answer } = await request.json();

        if (!question || typeof question !== 'string' || !answer || typeof answer !== 'string') {
            return NextResponse.json({ error: "Invalid input: question and answer are required." }, { status: 400 });
        }
        if (answer.length > 2000) { // Increased limit slightly, adjust as needed
             return NextResponse.json({ error: "Answer is too long for the demo." }, { status: 400 });
        }

        const prompt = constructDemoFeedbackPrompt(question, answer);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const generationConfig: GenerationConfig = {
            temperature: 0.6,
            maxOutputTokens: 512,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];
        console.log(`Calling Gemini for IP ${ip}, Question: "${question.substring(0,50)}..."`);
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });

        const responseText = result.response.text();
        let cleanedJsonText = responseText.trim();
        if (cleanedJsonText.startsWith('```json')) cleanedJsonText = cleanedJsonText.substring(7);
        else if (cleanedJsonText.startsWith('```')) cleanedJsonText = cleanedJsonText.substring(3);
        if (cleanedJsonText.endsWith('```')) cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
        
        const feedbackJson = JSON.parse(cleanedJsonText.trim());

        return NextResponse.json({ feedback: feedbackJson });

    } catch (error: any) {
        console.error(`Error in demo-feedback API (main logic) for IP ${ip}:`, error);
        if (error.message && error.message.includes("JSON.parse")) {
             return NextResponse.json({ error: "AI returned an unexpected format. Please try a different answer." }, { status: 500 });
        }
        // Check for Gemini API specific errors (e.g., quota, billing)
        if (error.message && error.message.includes("Quota") || error.message && error.message.includes("billing")) {
            return NextResponse.json({ error: "AI service quota exceeded. Please try again later." }, { status: 429 });
        }
        return NextResponse.json({ error: "Failed to get AI feedback. Please try again." }, { status: 500 });
    }
}