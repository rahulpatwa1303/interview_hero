'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
