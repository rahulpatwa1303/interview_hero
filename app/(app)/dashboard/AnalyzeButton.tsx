// app/(app)/dashboard/AnalyzeButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { analyzeInterviewSessionAction } from '../interview/actions';
import { toast } from 'sonner';
import { BarChart2 } from 'lucide-react'; // Or your preferred spinner and icon
import { PiSpinner } from 'react-icons/pi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface AnalyzeButtonProps {
    sessionId: string;
}

export default function AnalyzeButton({ sessionId }: AnalyzeButtonProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const router = useRouter();

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        toast("Starting analysis, this may take a moment...");
        const result = await analyzeInterviewSessionAction(sessionId);
        setIsAnalyzing(false);

        if (result.success) {
            if (result.error === "Analysis already exists for this session.") {
                toast.info(result.error + " Navigating to review.");
            } else {
                toast.success("Analysis complete!");
            }
            router.push(`/interview/${sessionId}/review`); // Navigate to review page
            router.refresh(); // Refresh dashboard data to update status
        } else {
            toast.error(`Analysis failed: ${result.error || 'Unknown error'}`);
        }
    };

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="secondary" size="sm" onClick={handleAnalyze} disabled={isAnalyzing} title="Analyze Session">
                        {isAnalyzing ? <PiSpinner className="h-4 w-4 animate-spin" /> : <BarChart2 className="h-4 w-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="flex mt-2 items-center gap-4 bg-muted p-2 rounded-md">
                    Analysis interview
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}