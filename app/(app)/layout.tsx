// app/(app)/layout.tsx
'use client'; // This layout will have client-side interactivity (sidebar collapse)

import * as React from 'react';
import { redirect, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Client for session check

import { cn } from '@/lib/utils';
import { Nav } from '@/components/nav';
import { UserNav } from '@/components/user-nav';
import { Icons } from '@/components/icons';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from "@/components/ui/sonner"
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, Sparkles, Swords } from 'lucide-react';
import Image from 'next/image';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose // Optional for explicit close buttons inside
} from "@/components/ui/sheet";


interface AppLayoutProps {
    children: React.ReactNode;
    defaultLayout?: number[] | undefined;
    defaultCollapsed?: boolean;
    navCollapsedSize?: number;
}

export default function AppLayout({
    children,
    defaultLayout = [20, 80], // Default sidebar width percentage
    defaultCollapsed = false,
    navCollapsedSize = 4, // Corresponds to 1rem (size-4 for icons)
}: AppLayoutProps) {
    const supabase = createClient();
    const [user, setUser] = React.useState<any | null>(null);
    const [userProfile, setUserProfile] = React.useState<any | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const pathname = usePathname();
    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);


    React.useEffect(() => {
        const fetchUserSession = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                redirect('/login?message=Session expired or not found. Please log in.');
                return;
            }
            setUser(session.user);

            // Fetch user profile from public.users
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('name, avatar_url, profile_complete')
                .eq('id', session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
                console.error("Error fetching user profile in layout:", profileError);
                // Potentially handle this error, e.g., by showing a toast
            } else {
                setUserProfile(profileData);
                if (profileData && !profileData.profile_complete && pathname !== '/profile/setup') {
                    // If profile is not complete and we are NOT on the setup page, redirect.
                    redirect('/profile/setup?message=Please complete your profile to continue.');
                    return;
                }
            }
            setIsLoading(false);
        };

        fetchUserSession();
    }, [supabase, pathname]); // Rerun if pathname changes to handle redirects correctly

    const mainNavLinks = [
        { title: 'Dashboard', icon: Icons.home, variant: 'ghost' as const, href: '/dashboard' },
        { title: 'Interview', icon: Icons.interview, variant: 'ghost' as const, href: '/interview' },
    ];

    const bottomNavLinks = [
        { title: 'Profile', icon: Icons.user, variant: 'ghost' as const, href: '/profile' },
        // { title: 'Settings', icon: Icons.settings, variant: 'ghost' as const, href: '/settings' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) { // Should be handled by redirect, but as a safeguard
        return null;
    }

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
                }}
                className="h-full max-h-screen items-stretch"
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={15}
                    maxSize={25}
                    onCollapse={() => {
                        setIsCollapsed(true);
                        document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
                    }}
                    onExpand={() => {
                        setIsCollapsed(false);
                        document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
                    }}
                    className={cn(
                        'hidden md:block transition-all duration-300 ease-in-out',
                        isCollapsed && 'min-w-[calc(var(--nav-collapsed-size)*1rem)] max-w-[calc(var(--nav-collapsed-size)*1rem)] pt-10'
                    )}
                    style={{ '--nav-collapsed-size': navCollapsedSize } as React.CSSProperties}
                >
                    <div className={cn("flex h-[56px] items-center justify-center px-2 sticky top-0 bg-background z-10 border-b", isCollapsed ? 'px-0' : 'px-4')}>
                        {/* Optionally add a logo or app name here */}
                        <Link href="/dashboard" className={cn("font-bold text-lg flex flex-row items-center", isCollapsed && "hidden",)}>
                            <Image src={'/images/interview_hero.png'} height={20} width={20} alt='interview_hero' /><span className={cn(isCollapsed && "hidden",)}>InterviewHero</span>
                        </Link>
                        <Button variant="ghost" size="icon" className={cn("ml-auto", !isCollapsed && "hidden")} onClick={() => setIsCollapsed(false)}>
                            <Icons.panelLeft className="h-5 w-5" />
                        </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-56px)]">
                        <Nav
                            isCollapsed={isCollapsed}
                            links={mainNavLinks}
                            bottomLinks={bottomNavLinks}
                        />
                    </ScrollArea>
                </ResizablePanel>
                <ResizableHandle withHandle className="hidden md:flex" />
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <div className="flex flex-col h-screen">
                        <header className="sticky top-0 z-10 flex h-fit py-[9.5px] items-center gap-1 border-b bg-background px-4">
                            {/* Mobile Nav Toggle - shows on small screens */}
                            {/* <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setIsMobileNavOpen(false)} // Need state for mobile nav
                            >
                                <Icons.panelLeft className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button> */}
                                                   <div className="md:hidden"> {/* Only show on mobile */}
                            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle navigation menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="flex flex-col p-0 w-64 sm:w-72"> {/* Added width */}
                                    <SheetHeader className="p-4 border-b">
                                        <SheetTitle asChild>
                                            <Link href="/dashboard" className="font-bold text-lg flex flex-row items-center" onClick={() => setIsMobileNavOpen(false)}>
                                                <Image src={'/images/interview_hero.png'} height={20} width={20} alt='interview_hero' />
                                                <span>InterviewHero</span>
                                            </Link>
                                        </SheetTitle>
                                    </SheetHeader>
                                    <ScrollArea className="flex-1"> {/* Scrollable Nav for mobile */}
                                        {/* Use the same Nav component, always un-collapsed for mobile sheet */}
                                        <Nav 
                                            isCollapsed={false} 
                                            links={mainNavLinks} 
                                            bottomLinks={bottomNavLinks} 
                                            // Optional: Add an onLinkClick prop to Nav to call setIsMobileNavOpen(false)
                                            // if Nav links don't cause pathname to change (e.g. hash links)
                                        />
                                    </ScrollArea>
                                    {/* Optional: Footer in sheet */}
                                </SheetContent>
                            </Sheet>
                            </div>
                            <h1 className="text-xl font-semibold ml-2 md:ml-0">
                                {/* Dynamically set page title based on route or context */}
                                {mainNavLinks.find(link => pathname.startsWith(link.href))?.title ||
                                    bottomNavLinks.find(link => pathname.startsWith(link.href))?.title ||
                                    'Page'}
                            </h1>
                            {/* Optional: Breadcrumbs or search */}
                            <div className="ml-auto flex items-center gap-2">
                                {/* <SearchInput /> */}
                                <UserNav
                                    userEmail={user?.email}
                                    userName={userProfile?.name}
                                    userAvatarUrl={userProfile?.avatar_url}
                                />
                                <ThemeToggle />
                            </div>

                        </header>
                        <ScrollArea className="flex-grow min-h-0"> {/* ScrollArea grows and allows its child (main) to scroll if needed */}
                            <main className="p-4 md:p-6 lg:p-8 flex flex-col h-full"> {/* Main takes full height of ScrollArea content and is flex-col */}
                                {children} {/* Your InterviewReviewPage will go here and can use h-full */}
                            </main>
                        </ScrollArea>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
            {/* <Toaster /> */}
        </TooltipProvider>
    );
}