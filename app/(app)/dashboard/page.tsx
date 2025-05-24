// app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // npx shadcn-ui@latest add badge
import { Eye, Info, PlayCircle, PlusCircle } from 'lucide-react';
import { addHours, format, parseISO } from 'date-fns'; // npm install date-fns
import StartInterviewButton from './StartInterviewButton';
import AnalyzeButton from './AnalyzeButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { ITEMS_PER_PAGE } from '@/lib/utils';
import PaginationControls from '@/components/ui/PaginationControls';
import DashboardFilters from './DashboardFilters';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Helper function to auto-complete old sessions - can be called here or moved to a shared actions file
async function ensureOldSessionsCompleted(userId: string, supabaseClient: any) { // Pass supabaseClient
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const { error: updateError } = await supabaseClient
    .from('interview_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .lt('started_at', threeHoursAgo);

  if (updateError) {
    console.error("Dashboard: Error auto-completing old sessions:", updateError.message);
  }
}

// Define types for props and searchParams
interface DashboardPageProps {
  searchParams?: {
    page?: string;
    limit?: string;
    status?: string; // Filter by status
    topic?: string;  // Search by topic
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This should ideally be caught by the (app)/layout.tsx
    return redirect('/login?message=You need to be logged in.');
  }

  await ensureOldSessionsCompleted(user.id, supabase);
  // Check if profile is complete (also done in layout, but good for direct page access logic)
  const { data: userProfile, error: profileErrorCheck } = await supabase
    .from('users')
    .select('profile_complete')
    .eq('id', user.id)
    .single();

  if (profileErrorCheck && profileErrorCheck.code !== 'PGRST116') {
    console.error("Dashboard: Error fetching profile status", profileErrorCheck);
    // Handle error appropriately
  }
  if (!userProfile?.profile_complete) {
    return redirect('/profile/setup?message=Please complete your profile to view the dashboard.');
  }

  const currentPage = parseInt((await searchParams)?.page || '1', 10);
  const limit = parseInt((await searchParams)?.limit || ITEMS_PER_PAGE.toString(), 10);
  const statusFilter = (await searchParams)?.status || '';
  const topicSearch = (await searchParams)?.topic || '';

  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('interview_sessions')
    .select('id, started_at, completed_at, topic, status', { count: 'exact' }) // Get total count
    .eq('user_id', user.id).order('started_at', { ascending: false }); // Show newest first

  if (statusFilter && statusFilter !== "all") {
    query = query.eq('status', statusFilter);
  }
  if (topicSearch) {
    query = query.ilike('topic', `%${topicSearch}%`); // Case-insensitive search
  }

  query = query.order('started_at', { ascending: false }).range(from, to);

  const { data: sessions, error: sessionsError, count: totalCount } = await query;


  if (sessionsError) {
    console.error("Error fetching interview sessions:", sessionsError);
    // Handle error - maybe show a message to the user
  }

  const getExpirationTime = (startedAt: string): string => {
    try {
      const startTime = parseISO(startedAt);
      const expirationTime = addHours(startTime, 3);
      return formatDate(expirationTime.toISOString());
    } catch (e) {
      return 'Error calculating expiration';
    }
  };

  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 0;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy HH:mm');
    } catch (e) {
      return dateString; // Fallback if parsing fails
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Interview History</CardTitle>
              <CardDescription>Review your past practice sessions.</CardDescription>
            </div>
            <StartInterviewButton />
          </CardHeader>
          <CardContent>
            <DashboardFilters currentStatus={statusFilter} currentTopic={topicSearch} />
            {/* Top Pagination */}
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/dashboard"
                currentFilters={{ status: statusFilter, topic: topicSearch, limit: limit.toString() }}
              />
            )}
           <div className="w-full overflow-x-auto rounded-md border">

              {sessions && sessions.length > 0 ? (
                <Table className="min-w-[600px] sm:min-w-full">
                  <ScrollBar orientation="horizontal" />
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.topic || 'General'}</TableCell>
                        <TableCell>
                          <Badge variant={session.status === 'completed' ? 'default' : session.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {session.status}
                          </Badge>
                        </TableCell>
                        {/* <TableCell>{formatDate(session.started_at)}</TableCell> */}
                        <TableCell>
                          {session.status === 'in_progress' && session.started_at ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {/* Wrap in a span to make the trigger area clear and add cursor */}
                                <span className="flex items-center gap-1 cursor-help underline decoration-dotted decoration-muted-foreground">
                                  {formatDate(session.started_at)}
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start" className="text-xs bg-muted p-2 rounded-md shadow"> {/* Custom class for smaller text */}
                                <p>This session will auto-complete around:</p>
                                <p className="font-semibold">{getExpirationTime(session.started_at)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            formatDate(session.started_at) // Or 'N/A' or other display for non-in-progress
                          )}
                        </TableCell>
                        <TableCell>{session.completed_at ? formatDate(session.completed_at) : 'In Progress'}</TableCell>
                        <TableCell className="text-center flex items-center justify-end gap-2" >
                          {session.status === 'in_progress' ? (
                            <Button variant="outline" size="sm" asChild title="Resume Interview">
                              <Link href={`/interview/${session.id}?q=1`}>
                                <PlayCircle className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Resume</span>
                              </Link>
                            </Button>
                          ) : (session.status === 'completed' || session.status === 'analyzed') ? (
                            <Button variant="outline" size="sm" asChild title="View Review">
                              <Link href={`/interview/${session.id}/review`}>
                                <Eye className="h-4 w-4 md:mr-1" /> <span className="hidden md:inline">Review</span>
                              </Link>
                            </Button>
                          ) : null}
                          {(session.status === 'completed' || session.status === 'analyzed') && ( // Only show Analyze button if completed but not yet analyzed
                            <AnalyzeButton sessionId={session.id} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">You haven't started any interview sessions yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/interview/new">
                      <PlusCircle className="mr-2 h-4 w-4" /> Start Your First Interview
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}