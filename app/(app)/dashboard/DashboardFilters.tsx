// app/(app)/dashboard/DashboardFilters.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

// Debounce helper
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
}


export default function DashboardFilters({
    currentStatus,
    currentTopic,
}: {
    currentStatus?: string;
    currentTopic?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // To get existing params like page/limit

    // Local state for inputs to allow debouncing/manual apply
    const [topicSearchInput, setTopicSearchInput] = useState(currentTopic || '');
    const [statusFilterInput, setStatusFilterInput] = useState(currentStatus || 'all');

    const createQueryString = useCallback(
        (paramsToUpdate: Record<string, string | null>) => {
            const current = new URLSearchParams(Array.from(searchParams.entries())); // Create mutable copy
            
            Object.entries(paramsToUpdate).forEach(([name, value]) => {
                if (value === null || value === '') {
                    current.delete(name);
                } else {
                    current.set(name, value);
                }
            });
            // Always reset to page 1 when filters change
            current.set('page', '1');
            return current.toString();
        },
        [searchParams]
    );

    const applyFilters = () => {
        router.push(pathname + '?' + createQueryString({ 
            topic: topicSearchInput.trim(), 
            status: statusFilterInput === 'all' ? null : statusFilterInput 
        }), { scroll: false });
    };
    
    // Debounced version of applyFilters for topic search (optional)
    // const debouncedApplyTopicSearch = useCallback(debounce(applyFilters, 500), [applyFilters]);
    // If using debounced search, call it in topic input's onChange. For now, using Apply button.

    const handleClearFilters = () => {
        setTopicSearchInput('');
        setStatusFilterInput('all');
        router.push(pathname + '?' + createQueryString({ topic: null, status: null, page: '1'}), { scroll: false });
    };
    
    // Sync local state if URL params change from outside (e.g., pagination)
    useEffect(() => {
        setTopicSearchInput(searchParams.get('topic') || '');
        setStatusFilterInput(searchParams.get('status') || 'all');
    }, [searchParams]);


    const sessionStatuses = ["all", "in_progress", "completed", "analyzed", "abandoned", "expired"]; // Add all your statuses

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border rounded-lg items-end">
            <div className="flex-1 min-w-0">
                <Label htmlFor="topic-search" className="text-sm font-medium">Search by Topic</Label>
                <Input
                    id="topic-search"
                    type="search"
                    placeholder="Enter topic..."
                    value={topicSearchInput}
                    onChange={(e) => setTopicSearchInput(e.target.value)}
                    className="mt-1"
                />
            </div>
            <div className="w-full sm:w-auto">
                <Label htmlFor="status-filter" className="text-sm font-medium">Filter by Status</Label>
                <Select
                    value={statusFilterInput}
                    onValueChange={(value) => {
                        setStatusFilterInput(value);
                        // Optionally apply status filter immediately on change:
                        // router.push(pathname + '?' + createQueryString({ status: value === 'all' ? null : value, topic: topicSearchInput.trim() }), { scroll: false });
                    }}
                >
                    <SelectTrigger id="status-filter" className="w-full sm:w-[180px] mt-1">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {sessionStatuses.map(status => (
                            <SelectItem key={status} value={status} className="capitalize">
                                {status.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={applyFilters} className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2"/> Apply
            </Button>
            {(currentTopic || currentStatus) && ( // Show clear only if filters are active
                <Button onClick={handleClearFilters} variant="ghost" className="w-full sm:w-auto">
                    <X className="h-4 w-4 mr-2"/> Clear
                </Button>
            )}
        </div>
    );
}