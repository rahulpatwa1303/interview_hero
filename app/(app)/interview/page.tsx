// app/(app)/interview/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PlayCircle, ListChecks, Zap, Clock, PlusCircle } from "lucide-react"; // Example icons
import { getInProgressSessionsForUser } from "./actions";
import { format, parseISO } from 'date-fns'; // For formatting dates
import StartInterviewButton from "../dashboard/StartInterviewButton";
import { PiTreeStructureThin } from "react-icons/pi";
import { MdOutlineDesignServices } from "react-icons/md";


// You'd fetch these if you want to list in-progress sessions
// async function getInProgressSessions(userId: string) { /* ... */ }
// formatDate can be a shared utility
const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
        return dateString;
    }
};

export default async function InterviewHubPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // const inProgressSessions = user ? await getInProgressSessions(user.id) : [];
    let inProgressSessions: any[] = []; // Initialize as empty array
    if (user) {
        inProgressSessions = await getInProgressSessionsForUser(user.id);
    }


    return (
        <div className="space-y-8">
            <section className="text-center py-8 bg-secondary/50 rounded-lg">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Interview Practice Center</h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Hone your skills, get AI-powered feedback, and ace your next technical interview.
                </p>
                <StartInterviewButton
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    iconName={'play'}
                    checkProfileCompletion={true}
                >
                    <PlayCircle className="mr-2 h-4 w-4" /> Start New Mock Interview {/* Custom children for button text */}
                </StartInterviewButton>
            </section>


            {/* Section for "Resume In-Progress Interviews" */}
            {inProgressSessions.length > 0 && (
                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Clock className="h-6 w-6 text-blue-500" />
                                Resume Your In-Progress Interviews
                            </CardTitle>
                            <CardDescription>Pick up where you left off.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {inProgressSessions.map((session) => (
                                    <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium break-words">{session.topic || 'General Practice'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Started: {formatDate(session.started_at)}
                                            </p>
                                        </div>
                                        <Button size="sm" asChild className="w-full mt-2 sm:mt-0 sm:w-auto shrink-0">
                                            <Link href={`/interview/${session.id}?q=1`}>
                                                <PlayCircle className="mr-2 h-4 w-4" /> Resume
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}
            {user && inProgressSessions.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">You have no interviews currently in progress.</p>
                    </CardContent>
                </Card>
            )}


            <section className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-blue-500" /> Practice by Topic</CardTitle>
                        <CardDescription>Focus on specific areas you want to improve.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* TODO: Add a form or links for topic-specific practice */}
                        <p className="text-sm text-muted-foreground">Select from common topics or enter your own to start a focused session.</p>
                        {/* <Button variant="outline" className="mt-4" asChild>
                            <Link href="/interview/new?topic=Data%20Structures">Practice Data Structures</Link>
                        </Button> */}
                        <div className="flex flex-row flex-wrap gap-2">

                            <StartInterviewButton
                                variant="outline"
                                className="mt-4"
                                navigateTo="/interview/new?topic=Data%20Structures"
                                checkProfileCompletion={true}
                                iconName="list" // Example icon name
                            >
                                <PiTreeStructureThin className="mr-2 h-4 w-4" /> Practice Data Structures
                            </StartInterviewButton>
                            <StartInterviewButton
                                variant="outline"
                                className="mt-4"
                                navigateTo="/interview/new?topic=System%20Design"
                                checkProfileCompletion={true}
                                iconName="list" // Example icon name
                            >
                                <MdOutlineDesignServices className="mr-2 h-4 w-4" /> Practice System Design
                            </StartInterviewButton>
                        </div>

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Zap className="h-6 w-6 text-green-500" /> Quick Coding Challenge</CardTitle>
                        <CardDescription>Solve a quick coding problem against the clock.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">(Feature coming soon)</p>
                        <Button variant="outline" className="mt-4" disabled>Start Quick Challenge</Button>
                    </CardContent>
                </Card>
            </section>

            {/* TODO: Section for "Resume In-Progress Interviews" if you implement that */}
            {/* {inProgressSessions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Resume Your Sessions</h2>
          // ... list sessions ...
        </section>
      )} */}
        </div>
    );
}