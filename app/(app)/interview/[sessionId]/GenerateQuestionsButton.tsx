// app/(app)/interview/[sessionId]/GenerateQuestionsButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For manual refresh if needed
import { Button } from '@/components/ui/button';
import { generateAndInsertQuestionsAction } from '../actions'; // Import server action
import {toast} from 'sonner'
import { Icons } from '@/components/icons';

interface GenerateQuestionsButtonProps {
  sessionId: string;
}

export default function GenerateQuestionsButton({ sessionId }: GenerateQuestionsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    const result = await generateAndInsertQuestionsAction(sessionId);
    setIsLoading(false);

    if (result.success) {
      toast( 'Questions generated! The page will now update.' );
      // The revalidatePath in the action should trigger a refresh of data for the Server Component.
      // If not, a router.refresh() can be a more forceful client-side refresh.
      router.refresh(); 
    } else {
      toast( result.error || 'Could not generate questions.',
      );
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? 'Generating...' : 'Generate Questions'}
    </Button>
  );
}