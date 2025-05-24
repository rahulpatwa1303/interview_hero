// components/landing/HeroSection.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react'; // For a bit of flair

export default function HeroSection() {
  return (
    <section className="py-20 sm:py-28 md:py-32 lg:py-40 bg-gradient-to-b from-background to-secondary/10"> {/* Subtle gradient */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary mb-6 animate-pulse" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
          Ace Your Tech Interview with <span className="text-primary">AI Power</span>.
        </h1>
        <p className="mt-6 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-muted-foreground">
          Practice realistic mock interviews, get instant, personalized feedback,
          and land your dream tech job with Interview Hero.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link href="/login">Start Practicing Now</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
            <Link href="#features">Learn More</Link> 
          </Button>
        </div>
      </div>
    </section>
  );
}