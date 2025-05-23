// app/login/layout.tsx
import { Toaster } from "@/components/ui/sonner"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
  
}