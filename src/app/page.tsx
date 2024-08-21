"use server";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function Home() {
  const startInterview = async () => {
    "use server";
    redirect(`/consent`);
  };

  return (
    <div className="bg-light-background dark:bg-dark-background h-screen flex w-screen justify-evenly items-center">
      <div className="text-light-main dark:text-dark-main flex flex-col gap-4">
        <p className="text-8xl font-extrabold">INTERVIEWHERO</p>
        <p className="text-3xl font-medium">Hero Up for Your Interview!</p>
        <p className="text-base font-medium max-w-[23rem]">
          Unlock your dev interview superpowers Practice code, master questions,
          conquer your interview with InterviewHero.
        </p>
        <form action={startInterview}>
          <button
            type="submit"
            className="text-base bg-light-primary dark:bg-dark-primary font-medium w-auto max-w-40 px-6 rounded-xl py-3 text-light-background dark:text-dark-background hover:brightness-125"
          >
            GET STARTED
          </button>
        </form>
      </div>
      <div className="w-96 h-96 animate-bounce">
        <Image
          src={"/star-badge.png"}
          alt="star-badge"
          width={900}
          height={100}
        />
      </div>
    </div>
  );
}
