"use client";

import { Button } from "@/components/AnimatedButton";
import { useRouter } from "next/navigation";
import { createInterview } from "./action";

async function CandidateConsent() {
  const router = useRouter();
  const redirectAfterConsent = async () => {
    let sessionID = (Math.random() + 1).toString(36).substring(7);

    // Save the sessionID to the interview model
    await createInterview(sessionID);

    // Redirect the user
    router.push(`/interview/${sessionID}/candidate_details`);
  };

  return (
    <div className="bg-light-background dark:bg-dark-background h-screen flex w-screen justify-evenly items-center">
      <div className="px-8 py-6 bg-light-card dark:bg-dark-card rounded-2xl flex flex-col gap-6">
        <h1 className="text-4xl text-light-main dark:text-dark-main font-bold">
          Personalize Your Experience
        </h1>
        <section className="max-w-sm">
          <h4 className="text-md text-light-main dark:text-dark-main">
            To personalize your experience, please tell us a bit about your
            background and career goals
          </h4>
          <form action={redirectAfterConsent}>
            <Button
              variant={"animated"}
              className="bg-light-primary dark:bg-dark-primary px-8 py-2 text-white text-xl font-semibold rounded-xl mt-2"
            >
              Yes, Personalize
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default CandidateConsent;
