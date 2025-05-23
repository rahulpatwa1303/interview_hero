// components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Settings,
  LogOut,
  BotMessageSquare, // For Interview
  UserCircle, // Placeholder for Profile, though avatar is better
  LucideIcon,
  BrainCircuit // Placeholder for App Icon
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js'; // Supabase user type
import { Database } from '@/lib/database.types'; // For userProfile type

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: (pathname: string) => boolean;
}

interface SidebarProps {
  user: SupabaseUser;
  userProfile: Pick<Database['public']['Tables']['users']['Row'], 'name' | 'avatar_url'> | null;
}

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
  return nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function Sidebar({ user, userProfile }: SidebarProps) {
  const pathname = usePathname();

  const topNavItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Home',
      icon: Home,
      isActive: (path) => path === '/dashboard' || path === '/',
    },
    {
      href: '/interview',
      label: 'Interview',
      icon: BotMessageSquare,
      isActive: (path) => path.startsWith('/interview'),
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      isActive: (path) => path.startsWith('/settings'),
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="sticky top-0 left-0 z-30 flex h-screen w-16 flex-col border-r bg-background transition-all duration-150 ease-in-out md:w-60 print:hidden">
        {/* App Logo/Name */}
        <div className="flex h-16 items-center justify-center border-b md:justify-start md:px-5">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold group">
            <BrainCircuit className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <span className="hidden text-lg font-bold md:inline">AI Interviewer</span>
          </Link>
        </div>

        {/* Top Navigation */}
        <nav className="flex flex-grow flex-col gap-1 p-2 md:p-3">
          {topNavItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    buttonVariants({
                      variant: item.isActive?.(pathname) ? 'secondary' : 'ghost',
                      size: 'lg', // Larger touch targets
                    }),
                    'w-full justify-center md:justify-start text-sm',
                    item.isActive?.(pathname) && 'font-semibold'
                  )}
                >
                  <item.icon className="h-5 w-5 md:mr-3" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden" sideOffset={5}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <nav className="mt-auto flex flex-col gap-1 border-t p-2 md:p-3">
          {bottomNavItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    buttonVariants({
                      variant: item.isActive?.(pathname) ? 'secondary' : 'ghost',
                      size: 'lg',
                    }),
                    'w-full justify-center md:justify-start text-sm',
                     item.isActive?.(pathname) && 'font-semibold'
                  )}
                >
                  <item.icon className="h-5 w-5 md:mr-3" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden" sideOffset={5}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Profile Section */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/profile/setup" // Or a dedicated /profile page to view/edit
                className={cn(
                  buttonVariants({
                    variant: pathname.startsWith('/profile') ? 'secondary' : 'ghost',
                    size: 'lg',
                  }),
                  'w-full justify-center md:justify-start items-center text-sm',
                  pathname.startsWith('/profile') && 'font-semibold'
                )}
              >
                <Avatar className="h-7 w-7 md:mr-3">
                  <AvatarImage src={userProfile?.avatar_url ?? undefined} alt={userProfile?.name ?? user.email ?? 'User'} />
                  <AvatarFallback>{getInitials(userProfile?.name ?? user.email)}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline truncate max-w-[120px]">{userProfile?.name || user.email?.split('@')[0]}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="md:hidden" sideOffset={5}>
              Profile
            </TooltipContent>
          </Tooltip>

          {/* Sign Out Form */}
          <form action="/auth/sign-out" method="POST" className="w-full mt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive-foreground md:justify-start text-sm font-normal"
                  type="submit"
                >
                  <LogOut className="h-5 w-5 md:mr-3" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden" sideOffset={5}>
                Sign Out
              </TooltipContent>
            </Tooltip>
          </form>
        </nav>
      </aside>
    </TooltipProvider>
  );
}