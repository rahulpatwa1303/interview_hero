
import GetStartedButton from "./_component/GetStartedButton";

function Home() {
  return (
    <div className="flex justify-center items-center text-light-onSurface dark:text-dark-onSurface flex-col h-full">
      <h1 className="text-7xl">InterviewHero</h1>
      <div className="flex flex-col justify-evenly items-center gap-8 mt-4">
        <h1 className="text-2xl">Hero Up for Your Interview!</h1>
        <GetStartedButton />
        <p className="text-center text-lg">
          Unlock your dev interview superpowers <br />
          Practice code, master questions, conquer your interview with
          InterviewHero.
        </p>
      </div>
    </div>
  );
}

export default Home;
