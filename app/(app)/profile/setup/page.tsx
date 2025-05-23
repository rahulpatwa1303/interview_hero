// app/(app)/profile/setup/page.tsx
import ProfileSetupForm from './ProfileSetupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfileSetupPage() {
  return (
    // This is the main scroll container. Keep it as is.
    <div className="container mx-auto min-h-screen p-4 overflow-y-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Fill in your details to personalize your interview practice experience.
            This information helps us tailor questions and feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/*
            MODIFIED THIS WRAPPER DIV:
            - Removed `min-h-screen`
            - Removed `overflow-y-auto`
            - Removed `p-4` (CardContent and ProfileSetupForm likely have padding; adjust if needed)
            - Kept `flex flex-col items-center` to center the ProfileSetupForm.
          */}
          <div className="flex flex-col items-center"> {/* Simplified classes */}
            <ProfileSetupForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}