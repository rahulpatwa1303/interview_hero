// app/page.tsx (assuming this is your landing page)
// Or, if you want it at /landing, create app/landing/page.tsx and app/landing/layout.tsx

// No 'use client' at the top level for the page component itself unless necessary for root interactions.
// Sections can be client components if they have heavy interactivity.

import Navbar from '@/components/landing/Navbar'; // New component
import HeroSection from '@/components/landing/HeroSection'; // New component
import ProblemSolutionSection from '@/components/landing/ProblemSolutionSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
// import BenefitsSection from '@/components/landing/BenefitsSection';
// import InteractiveDemo from '@/components/landing/InteractiveDemo'; // Optional
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import Footer from '@/components/landing/Footer';
import InteractiveDemo from '@/components/landing/InteractiveDemo';
// import { Button } from '@/components/ui/button'; // For global "Get Started" if needed in Navbar

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        {/* <BenefitsSection /> */}
        <InteractiveDemo /> {/* Optional */}
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}