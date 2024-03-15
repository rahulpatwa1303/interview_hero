import { Suspense } from "react";
import prisma from "../../../../prisma";
import { AnswerSection } from "./AnswerSection";

const FetchQuestion = async ({
  id,
  questionId,
}: {
  id: string;
  questionId: string;
}) => {
  const qId = parseInt(questionId);
  const interviewQuestion =
    await prisma.$queryRaw`select * from interview_question 
  where "interviewId" = ${id} 
  and "questionId" = ${qId}`;

  // PlayHT.init({
  //   apiKey: 'b54b8696d4e14c0c85ed02d614f10de9',
  //   userId: 'uCoEVCRKH0gjIewRs4B1mMBYKe92',
  //   defaultVoiceId:
  //     "s3://peregrine-voices/oliver_narrative2_parrot_saad/manifest.json",
  //   defaultVoiceEngine: "PlayHT2.0",
  // });

  // const generated = await PlayHT.generate('Computers can speak now!');

  // // Grab the generated file URL
  // const { audioUrl } = generated;

  // console.log("The url for the audio file is", audioUrl);

  return (
    <div className="p-6 bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest  rounded-lg shadow-lg drop-shadow-md space-y-4">
      <section className="flex text-xs ">
        <div className="p-2 bg-light-backgroundQTag/40 dark:bg-dark-backgroundQTag/40 rounded-lg">
          {interviewQuestion[0].type}
        </div>
      </section>
      <section className="flex text-2xl">
        <div className="p-2">{interviewQuestion[0].queston as string | ""}</div>
      </section>
      <AnswerSection {...interviewQuestion[0]}/>
    </div>
  );
};

function Interview({ params, searchParams }) {

  return (
    <Suspense fallback={<>loading....</>}>
      {/* we'll include the time and question tab here */}
      <div className="flex justify-center items-center h-full w-full text-light-onSurface dark:text-dark-onSurface">
        <FetchQuestion id={params.id} questionId={searchParams.q} />
      </div>
    </Suspense>
  );
}

export default Interview;
