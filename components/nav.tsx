// components/nav.tsx
'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: 'default' | 'ghost';
    href: string;
  }[];
  bottomLinks?: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: 'default' | 'ghost';
    href: string;
  }[];
}

export function Nav({ links, bottomLinks, isCollapsed }: NavProps) {
  const pathname = usePathname();

  const renderLink = (link: NavProps['links'][number], index: number) => (
    <TooltipProvider key={index} delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={link.href}
            className={cn(
              buttonVariants({ variant: link.href === pathname ? 'default' : link.variant, size: 'icon' }),
              'h-10 w-10',
              link.href === pathname &&
                'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
            )}
          >
            <link.icon className="h-5 w-5" />
            <span className="sr-only">{link.title}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {link.title}
          {link.label && (
            <span className="ml-auto text-muted-foreground">
              {link.label}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderCollapsedLink = (link: NavProps['links'][number], index: number) => (
     <Link
        key={index}
        href={link.href}
        className={cn(
          buttonVariants({ variant: link.href === pathname ? 'default' : link.variant, size: 'sm' }),
          link.href === pathname &&
            'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
          'justify-start h-10'
        )}
      >
        <link.icon className="mr-3 h-5 w-5" />
        {link.title}
        {link.label && (
          <span
            className={cn(
              'ml-auto',
              link.href === pathname && 'text-background dark:text-white'
            )}
          >
            {link.label}
          </span>
        )}
      </Link>
  );


  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? renderLink(link, index) : renderCollapsedLink(link,index)
        )}
      </nav>
      {bottomLinks && bottomLinks.length > 0 && (
        <>
        <Separator className="my-2 group-[[data-collapsed=true]]:mx-auto group-[[data-collapsed=true]]:w-3/4" />
        <nav className="mt-auto grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {bottomLinks.map((link, index) =>
            isCollapsed ? renderLink(link, index) : renderCollapsedLink(link, index)
          )}
        </nav>
        </>
      )}
    </div>
  );
}