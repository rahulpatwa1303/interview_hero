
// components/landing/Footer.tsx
import Link from 'next/link';
import { Swords } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Swords className="h-6 w-6 text-primary" />
                        <span className="font-semibold">Interview Hero</span>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <Link href="/about" className="hover:text-foreground">About</Link>
                        <Link href="/contact" className="hover:text-foreground">Contact</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms</Link>
                        <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
                    </nav>
                    <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Interview Hero. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
