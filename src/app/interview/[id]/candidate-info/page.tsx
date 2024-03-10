// "use client";
// import { usePathname } from "next/navigation";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import Form from "./form";

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

  // const path = usePathname().split("/");
  const session = await getServerSession();
  const headersList = headers();
  const path = headersList.get("referer")?.split("/") || "";

  return (
    <Suspense fallback={<p>Loading feed...</p>}>
      <div className="flex justify-center items-center h-full w-full text-light-onSurface dark:text-dark-onSurface">
        <div className="bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest  rounded-lg shadow-lg drop-shadow-md p-8 space-y-4">
          <h1 className="text-3xl font-bold">
            Tell me a little about yourself
          </h1>
          <Form />
        </div>
        {/* {path.includes("candidate-info") && <Carousel slides={slides} />} */}
      </div>
    </Suspense>
  );
}

export default GetStarted;
