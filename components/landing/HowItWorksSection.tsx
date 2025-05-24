// components/landing/HowItWorksSection.tsx
import { UserPlus, MessageSquareText, Award, BrainCircuit } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up & Profile',
    description: 'Create your account and tell us about your experience and target roles.',
  },
  {
    icon: BrainCircuit,
    title: 'Start Your Mock Interview',
    description: 'Choose a topic or go general. Our AI generates relevant questions for you.',
  },
  {
    icon: MessageSquareText,
    title: 'Answer & Get Feedback',
    description: 'Respond to questions via text or speech. Receive instant AI analysis.',
  },
  {
    icon: Award,
    title: 'Improve & Succeed',
    description: 'Identify weak spots, refine your answers, and ace your real interviews!',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Get Started in Minutes</h2>
          <p className="mt-4 text-lg text-muted-foreground">Simple steps to your interview success.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <step.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}