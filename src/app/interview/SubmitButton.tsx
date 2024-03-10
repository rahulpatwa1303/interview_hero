import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primary/70 hover:dark:bg-dark-primary/70">
      Let's Start!
    </Button>
  );
}

export default SubmitButton;
