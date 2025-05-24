// components/theme-toggle.tsx
'use client';

import { useAppTheme } from '@/components/theme-provider'; // Your custom hook
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react'; // Added Monitor for system

export function ThemeToggle() {
  // currentTheme is 'light', 'dark', or 'system' (our preference)
  // resolvedNextTheme is 'light' or 'dark' (what next-themes actually applies)
  const { setAppTheme, currentAppTheme, resolvedNextTheme, isDbThemeLoaded } = useAppTheme();

  if (!isDbThemeLoaded) {
    // Placeholder while loading theme preference, keep consistent icon size
    return <Button variant="outline" size="icon" disabled className="h-9 w-9 opacity-50"><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>;
  }

  // Display icon based on the theme that's actually rendered by next-themes
  const displayIcon = resolvedNextTheme === 'dark' ? 
    <Moon className="h-[1.2rem] w-[1.2rem] transition-all" /> : 
    <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          {displayIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setAppTheme('light')} disabled={currentAppTheme === 'light'}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAppTheme('dark')} disabled={currentAppTheme === 'dark'}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAppTheme('system')} disabled={currentAppTheme === 'system'}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}