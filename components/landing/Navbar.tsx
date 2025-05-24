// components/landing/Navbar.tsx
'use client'; // If it has client-side logic like sticky behavior or mobile menu

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react'; // Example Icon for "Interview Hero"
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-300 
                      ${isScrolled ? 'bg-background/80 border-border' : 'bg-transparent border-transparent'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          {/* <Swords className="h-7 w-7 text-primary" /> */}
          <Image src={'/images/interview_hero.png'} height={28} width={28} alt='interview_hero'/>

          <span>Interview Hero</span>
        </Link>
        <nav className="flex items-center gap-4">
          {/* <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link> */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Get Started Free</Link> 
          </Button>
        </nav>
      </div>
    </header>
  );
}