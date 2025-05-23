// app/(app)/dashboard/StartInterviewButton.tsx (or move to a shared components folder like app/(app)/components/StartInterviewButton.tsx)
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"; // Import ButtonProps
import { type VariantProps } from "class-variance-authority";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    // TooltipProvider, // Provided by parent
} from "@/components/ui/tooltip";
import { createClient } from '@/lib/supabase/client';
import { Icons } from '@/components/icons'; // For spinner
import { PlusCircle, AlertCircle, PlayCircle, Zap, ListChecks } from 'lucide-react'; // Default icon
import { toast } from "sonner";
import { getUserDailySessionCount } from '../interview/actions'; // Adjust path if component is moved
import { cn, SESSIONS_PER_DAY_LIMIT } from '@/lib/utils';
import Link from 'next/link'; // For using as a Link

const iconMap = {
    plus: PlusCircle,
    play: PlayCircle,
    list: ListChecks,
    zap: Zap,
    // Add more as needed
};

interface StartInterviewButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'> {
    children?: React.ReactNode; // Allow custom children for the button content
    defaultIcon?: React.ElementType; // Allow passing a different default icon
    iconName?: keyof typeof iconMap;
    navigateTo?: string; // Path to navigate to if not default /interview/new
    checkProfileCompletion?: boolean; // Whether to check profile and prompt
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
}

export default function StartInterviewButton({
    children,
    iconName,
    navigateTo = '/interview/new', // Default navigation target
    checkProfileCompletion = true, // Default to check profile
    variant = "default", // Default Shadcn button variant
    size = "default",    // Default Shadcn button size
    className,
    ...rest // Collect other valid ButtonProps
}: StartInterviewButtonProps) {
    const router = useRouter();
    const supabase = createClient();

    const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(checkProfileCompletion);
    const [sessionCount, setSessionCount] = useState<number | null>(null);
    const [isLoadingCount, setIsLoadingCount] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [showProfilePrompt, setShowProfilePrompt] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (checkProfileCompletion) setIsLoadingProfile(true);
            setIsLoadingCount(true);

            const { data: { user } } = await supabase.auth.getUser();

            if (user && isMounted) {
                const promises = [];
                if (checkProfileCompletion) {
                    promises.push(
                        supabase
                            .from('users')
                            .select('profile_complete')
                            .eq('id', user.id)
                            .single()
                    );
                } else {
                    promises.push(Promise.resolve({ data: { profile_complete: true }, error: null })); // Assume complete if not checking
                }
                promises.push(getUserDailySessionCount());

                const [profileResult, sessionCountResult] = await Promise.all(promises);

                if (isMounted) {
                    if (checkProfileCompletion) {
                        const { data: profile, error: profileError } = profileResult as any; // Cast if needed
                        if (profileError && profileError.code !== 'PGRST116') {
                            toast.error('Could not fetch profile status.');
                            setIsProfileComplete(false);
                        } else {
                            setIsProfileComplete(profile?.profile_complete ?? false);
                        }
                        setIsLoadingProfile(false);
                    } else {
                        setIsProfileComplete(true); // If not checking, assume profile is fine for this button's purpose
                        setIsLoadingProfile(false);
                    }

                    const { count, error: countError } = sessionCountResult as { count: number | null, error?: string };
                    if (countError) {
                        toast.error("Could not verify daily session count.");
                    } else {
                        setSessionCount(count);
                    }
                    setIsLoadingCount(false);
                }
            } else if (isMounted) {
                setIsProfileComplete(false);
                setIsLoadingProfile(false);
                setSessionCount(0);
                setIsLoadingCount(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [supabase, checkProfileCompletion]);

    const isLoadingInitialData = (checkProfileCompletion && isLoadingProfile) || isLoadingCount;
    const hasReachedSessionLimit = sessionCount !== null && sessionCount >= SESSIONS_PER_DAY_LIMIT;
    const buttonIsEffectivelyDisabled = isNavigating || isLoadingInitialData || hasReachedSessionLimit;

    const buttonDisabledReason = hasReachedSessionLimit
        ? `Daily limit of ${SESSIONS_PER_DAY_LIMIT} sessions reached.`
        : isLoadingInitialData
            ? "Loading data..."
            : null;

    const handlePrimaryButtonClick = () => {
        if (buttonIsEffectivelyDisabled && !isNavigating) {
            if (hasReachedSessionLimit) toast.error(`Daily limit of ${SESSIONS_PER_DAY_LIMIT} sessions reached.`);
            else if (isLoadingInitialData) toast.info("Data is still loading...");
            return;
        }
        if (isNavigating) return;

        if (checkProfileCompletion && isProfileComplete === false) {
            setShowProfilePrompt(true);
        } else {
            actualNavigate();
        }
    };

    const actualNavigate = () => {
        setIsNavigating(true);
        setShowProfilePrompt(false);
        router.push(navigateTo);
    };

    const navigateToNewInterviewPage = () => {
        setIsNavigating(true);
        setShowProfilePrompt(false); // Ensure dialog is closed
        router.push('/interview/new');
        // setIsNavigating(false); // router.push is async but doesn't return a promise to await UI update
        // For better UX, disable buttons until navigation effectively happens or page unmounts
    };

    const navigateToProfileSetup = () => {
        setIsNavigating(true);
        setShowProfilePrompt(false);
        router.push('/profile/setup');
    };

    const IconComponent = iconName ? iconMap[iconName] : PlusCircle;
    const buttonActualContent = children || (
        <>
            {isNavigating || isLoadingInitialData ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <IconComponent className="mr-2 h-4 w-4" />}
            {isLoadingInitialData ? "Loading..." : "Start New Interview"}
        </>
    );

    return (
        <>
            <Tooltip open={buttonIsEffectivelyDisabled && buttonDisabledReason ? undefined : false}>
                <TooltipTrigger asChild>
                    <span
                        tabIndex={buttonIsEffectivelyDisabled ? 0 : undefined}
                        className={buttonIsEffectivelyDisabled ? "inline-block cursor-not-allowed" : "inline-block"}
                    >
                        <Button
                            onClick={handlePrimaryButtonClick}
                            disabled={buttonIsEffectivelyDisabled}
                            aria-disabled={buttonIsEffectivelyDisabled}
                            variant={variant}
                            size={size}
                            className={cn("flex items-center", className)} // Combine passed className
                            {...rest} // Spread other ButtonProps
                        >
                            {buttonActualContent}
                        </Button>
                    </span>
                </TooltipTrigger>
                {buttonIsEffectivelyDisabled && buttonDisabledReason && (
                    <TooltipContent side="bottom" align="center" sideOffset={5} className="z-50 bg-destructive text-destructive-foreground p-2 rounded shadow-lg text-sm max-w-xs">
                        <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 shrink-0 text-destructive-foreground" />
                            <p>{buttonDisabledReason}</p>
                        </div>
                    </TooltipContent>
                )}
            </Tooltip>

            {checkProfileCompletion && ( // Only render Dialog if profile check is enabled
                <Dialog open={showProfilePrompt} onOpenChange={setShowProfilePrompt}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Complete Your Profile?</DialogTitle><DialogDescription>...</DialogDescription></DialogHeader>
                        <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
                            <DialogClose asChild><Button variant="outline" onClick={() => setShowProfilePrompt(false)} disabled={isNavigating}>Cancel</Button></DialogClose>
                            <div className="flex gap-2 flex-col sm:flex-row">
                                <Button onClick={actualNavigate} disabled={isNavigating}>{isNavigating && <Icons.spinner className="mr-1 h-4 w-4 animate-spin" />} Proceed with Generic</Button>
                                <Button onClick={navigateToProfileSetup} disabled={isNavigating}>{isNavigating && <Icons.spinner className="mr-1 h-4 w-4 animate-spin" />} Complete Profile</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}