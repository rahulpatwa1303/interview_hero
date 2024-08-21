import FormRender from "./formRender";

function CandidateInfo() {
  return (
    <div className="bg-light-background dark:bg-dark-background h-screen flex w-screen justify-evenly items-center">
      <div className="px-8 py-6 bg-light-card dark:bg-dark-card rounded-2xl flex flex-col gap-6">
        <h1 className="text-4xl text-light-main dark:text-dark-main font-bold">
          Tell Us About Yourself
        </h1>
        <section className="w-auto max-w-2xl">
          <FormRender />
        </section>
      </div>
    </div>
  );
}

export default CandidateInfo;
