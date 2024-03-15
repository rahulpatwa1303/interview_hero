import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { LuLoader2 } from "react-icons/lu";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="mt-8 flex flex-row-reverse">
      <Button
        disabled={pending}
        className="bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primary/70 hover:dark:bg-dark-primary/70 disabled:bg-light-onSurface/50 dark:disabled:bg-dark-onSurface/50 disabled:text-bg-light-onSurface dark:disabled:text-bg-dark-onSurface"
      >
        Next {pending && <LuLoader2 className="ml-4 animate-spin" />}
      </Button>
    </div>
  );
}

export default SubmitButton;
