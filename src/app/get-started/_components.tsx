"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { LuLoader2 } from "react-icons/lu";

export const RedirectButton = () => {
  const router = useRouter();

  return (
    <Button
      className="bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primary/70 hover:dark:bg-dark-primary/70"
      onClick={() => router.push("candidate-info")}
    >
      Let's Start!
    </Button>
  );
};

export const ActionButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      className="bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primary/70 hover:dark:bg-dark-primary/70 disabled:bg-light-onSurface/50 dark:disabled:bg-dark-onSurface/50 disabled:text-bg-light-onSurface dark:disabled:text-bg-dark-onSurface"
      disabled={pending}
    >
      Let's Start! {pending && <LuLoader2 className="ml-4 animate-spin" />}
    </Button>
  );
};
