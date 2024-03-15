// import { usePathname } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import prisma from "../../../../prisma";
import { ActionButton } from "../_components";


async function GetStarted() {
  const slides = [
    <div key={1} className="bg-blue-500 h-64">
      Slide 1
    </div>,
    <div key={2} className="bg-green-500 h-64">
      Slide 2
    </div>,
    <div key={3} className="bg-yellow-500 h-64">
      Slide 3
    </div>,
  ];

  function generateUniqueSessionId() {
    // Implement your logic to create a random, cryptographically secure string
    // This example uses the crypto module but consider security best practices
    const crypto = require("crypto");
    return crypto.randomBytes(16).toString("hex");
  }

  const createSession = async () => {
    "use server";
    const session = await getServerSession();
    const crypto = require("crypto");
    const sessionId = crypto.randomBytes(16).toString("hex");
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string,
      },
    });
    const newSession = await prisma.interviewSession.create({
      data: {
        user: { connect: { id: user?.id } }, // Connect to existing User
        sessionId,
      },
    });
    redirect(`/interview/${sessionId}/candidate-info`);
  };

  return (
    <Suspense fallback={<p>Loading feed...</p>}>
      <div className="flex justify-center items-center h-full w-full text-light-onSurface dark:text-dark-onSurface">
        <div className="bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest w-1/2 rounded-lg shadow-lg drop-shadow-md p-8 space-y-4">
          <h1 className="text-3xl font-bold">Let get started</h1>

          <p>
            Hey there! Before we dive in, I'd love to learn a bit more about
            your background and career goals. This helps me tailor the interview
            questions specifically to your needs and aspirations. Would you mind
            sharing a few details about yourself and your professional
            aspirations?
          </p>
          <form action={createSession}>
            <ActionButton/>
          </form>
        </div>
      </div>
    </Suspense>
  );
}

export default GetStarted;
