// app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// Table components are no longer directly used here for the main list
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Info, PlayCircle, PlusCircle, CalendarDays, CheckCircle, Clock } from 'lucide-react'; // Added more icons
import { addHours, format, parseISO, formatDistanceToNow } from 'date-fns'; // Added formatDistanceToNow
import StartInterviewButton from './StartInterviewButton';
import AnalyzeButton from './AnalyzeButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ITEMS_PER_PAGE } from '@/lib/utils'; // Ensure this path is correct
import PaginationControls from '@/components/ui/PaginationControls';
import DashboardFilters from './DashboardFilters';
// ScrollArea and ScrollBar are not needed for the card grid directly
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Define types for props and searchParams
type DashboardPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }; // Simplified for direct access
};

async function ensureOldSessionsCompleted(userId: string, supabaseClient: any) { /* ... same ... */ }

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/login?message=You need to be logged in.');
  await ensureOldSessionsCompleted(user.id, supabase);
  const { data: userProfile } = await supabase.from('users').select('profile_complete').eq('id', user.id).single();
  if (!userProfile?.profile_complete) return redirect('/profile/setup?message=Please complete your profile');

  const getStringParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0] || '';
    return param || '';
  };

  const currentPage = parseInt(getStringParam(searchParams?.page) || '1', 10);
  const limit = parseInt(getStringParam(searchParams?.limit) || ITEMS_PER_PAGE.toString(), 10);
  const statusFilter = getStringParam(searchParams?.status);
  const topicSearch = getStringParam(searchParams?.topic);

  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('interview_sessions')
    .select('id, started_at, completed_at, topic, status', { count: 'exact' })
    .eq('user_id', user.id);

  if (statusFilter && statusFilter !== "all") query = query.eq('status', statusFilter);
  if (topicSearch) query = query.ilike('topic', `%${topicSearch}%`);
  query = query.order('started_at', { ascending: false }).range(from, to);

  const { data: sessions, error: sessionsError, count: totalCount } = await query;

  if (sessionsError) console.error("Error fetching interview sessions:", sessionsError);

  const formatDate = (dateString?: string | null, customFormat = 'MMM d, yyyy, h:mm a') => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), customFormat); } catch (e) { return dateString; }
  };

  const getExpirationTime = (startedAt: string): string => {
    try {
      const startTime = parseISO(startedAt);
      const expirationTime = addHours(startTime, 3);
      return formatDate(expirationTime.toISOString());
    } catch (e) { return 'Error calculating expiration'; }
  };

  const totalPages = totalCount ? Math.ceil(totalCount / limit) : 0;

  return (
    <TooltipProvider delayDuration={100}> {/* delayDuration={0} for immediate */}
      <div className="space-y-6">
        <Card className='shadow-none'> {/* This outer card could be optional if page itself provides enough structure */}
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4">
            <div>
              <CardTitle className="text-2xl">Interview History</CardTitle>
              <CardDescription>Review your past practice sessions.</CardDescription>
            </div>
            <StartInterviewButton />
          </CardHeader>
          <CardContent className="pt-6 space-y-6"> {/* Added space-y for spacing between elements */}
            <DashboardFilters currentStatus={statusFilter} currentTopic={topicSearch} />

            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/dashboard"
                currentFilters={{ status: statusFilter, topic: topicSearch, limit: limit.toString() }}
                className="py-2"
              />
            )}

            {sessions && sessions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {sessions.map((session) => (
                  <Card key={session.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold leading-tight break-words">
                        {session.topic || 'General Practice'}
                      </CardTitle>
                      <Badge
                        variant={
                          session.status === 'analyzed' ? 'default' :
                            session.status === 'completed' ? 'default' :
                              session.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                        className="capitalize whitespace-nowrap w-fit text-xs mt-1.5"
                      >
                        {session.status?.replace('_', ' ') || 'Unknown'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-1.5 text-sm text-muted-foreground flex-grow">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {session.status === 'in_progress' && session.started_at ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 cursor-help underline decoration-dotted">
                                  Started: {formatDate(session.started_at, 'MMM d, h:mm a')}
                                  <Info className="h-3 w-3" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="start" className="text-xs bg-popover text-popover-foreground p-2 rounded-md shadow">
                                <p>Expires around: {getExpirationTime(session.started_at)}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            `Started: ${formatDate(session.started_at, 'MMM d, h:mm a')}`
                          )}
                        </span>
                      </div>
                      {session.completed_at && session.status !== 'in_progress' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Completed: {formatDate(session.completed_at, 'MMM d, h:mm a')}</span>
                        </div>
                      )}
                      {session.status === 'in_progress' && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>In Progress</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 border-t pt-3 pb-3">
                      {session.status === 'in_progress' ? (
                        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto justify-center">
                          <Link href={`/interview/${session.id}?q=1`}><PlayCircle className="h-4 w-4 mr-2" /> Resume</Link>
                        </Button>
                      ) : (session.status === 'completed' || session.status === 'analyzed') ? (
                        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto justify-center">
                          <Link href={`/interview/${session.id}/review`}><Eye className="h-4 w-4 mr-2" /> Review</Link>
                        </Button>
                      ) : null}
                      {session.status === 'completed' && ( // Only show if 'completed' but not yet 'analyzed'
                        <AnalyzeButton sessionId={session.id} />
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">
                  {statusFilter || topicSearch ? "No sessions match your filters." : "No interview sessions yet."}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {statusFilter || topicSearch ? "Try adjusting your filters or " : "Get started by creating your first one."}
                  {!(statusFilter || topicSearch) && <Link href="/interview/new" className="text-primary hover:underline">start a new interview</Link>}
                </p>
                {(statusFilter || topicSearch) && <Button variant="link" asChild className="mt-2"><Link href="/dashboard">Clear Filters</Link></Button>}
              </div>
            )}

            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/dashboard"
                currentFilters={{ status: statusFilter, topic: topicSearch, limit: limit.toString() }}
                className="mt-8 py-2" // Increased margin-top
              />
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}