// components/landing/ProblemSolutionSection.tsx
import { XCircle, CheckCircle2 } from 'lucide-react';

export default function ProblemSolutionSection() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tired of Unprepared Interviews?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Traditional interview prep can be isolating, expensive, or simply ineffective.
            Generic advice doesn't cut it when specific skills are on the line.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 p-6 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-destructive" />
              <h3 className="text-2xl font-semibold text-destructive-foreground">The Old Way</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-2">
              <li>Generic, outdated questions.</li>
              <li>No immediate, personalized feedback.</li>
              <li>Anxiety from lack of real practice.</li>
              <li>Expensive coaching or limited peer availability.</li>
            </ul>
          </div>
          <div className="space-y-4 p-6 border border-primary/20 rounded-lg bg-primary/5">
             <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-semibold text-primary">The Interview Hero Way</h3>
            </div>
            <ul className="list-disc list-inside text-foreground space-y-1 pl-2">
              <li>AI-generated, role & topic-specific questions.</li>
              <li>Instant, actionable feedback on your answers.</li>
              <li>Practice anytime, build confidence.</li>
              <li>Affordable and accessible preparation.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}