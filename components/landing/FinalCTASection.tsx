
// components/landing/FinalCTASection.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-t from-background to-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Ready to Ace Your Next Interview?
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
          Stop guessing, start practicing effectively. Join Interview Hero today and gain the confidence you need.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href="/login">Get Started for Free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
