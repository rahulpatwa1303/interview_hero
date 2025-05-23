// components/ui/PaginationControls.tsx (or similar shared location)
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITEMS_PER_PAGE } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g., /dashboard
  currentFilters?: Record<string, string | null>; // To preserve other filters
  className?: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  basePath,
  currentFilters = {},
  className,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname(); // Should match basePath if used on that page
  const searchParams = useSearchParams(); // To get existing params

  const createPageQueryString = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams); // Get current URL params
    Object.entries(currentFilters).forEach(([key, value]) => { // Preserve existing filters
        if (value !== null && value !== undefined && value !== '') {
            params.set(key, value);
        } else {
            params.delete(key); // Remove if filter value is empty/null
        }
    });
    params.set('page', pageNumber.toString());
    return params.toString();
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      router.push(`${basePath}?${createPageQueryString(pageNumber)}`, { scroll: false });
    }
  };
  
  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(currentFilters).forEach(([key, value]) => {
        if (key !== 'limit' && value !== null && value !== undefined && value !== '') {
            params.set(key, value);
        } else if (key !== 'limit') {
            params.delete(key);
        }
    });
    params.set('limit', newLimit);
    params.set('page', '1'); // Reset to page 1 when limit changes
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };


  if (totalPages <= 1) {
    return null; // Don't render pagination if only one page or no pages
  }

  const pageNumbers = [];
  const maxVisiblePages = 5; // How many page numbers to show directly

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-2 ${className}`}>
        <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                aria-label="Go to first page"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageNumbers[0] > 1 && ( // Show "..." if not starting from page 1
                 <Button variant="ghost" size="icon" disabled>...</Button>
            )}

            {pageNumbers.map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </Button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && ( // Show "..." if not ending at last page
                <Button variant="ghost" size="icon" disabled>...</Button>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Go to last page"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span>Rows per page:</span>
            <Select
                value={currentFilters.limit || ITEMS_PER_PAGE.toString()}
                onValueChange={handleLimitChange}
            >
                <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {[5, 10, 20, 50].map(val => (
                        <SelectItem key={val} value={val.toString()} className="text-xs">
                            {val}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );
}