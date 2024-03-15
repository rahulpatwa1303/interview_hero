import React from "react";

function Loading() {
  return (
    <div className="w-screen h-screen flex justify-center items-center text-light-onSurface dark:text-dark-onSurface animate-pulse">
      <div className=" p-6 rounded-lg flex justify-center items-center flex-col bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest shadow-lg drop-shadow-md"></div>
    </div>
  );
}

export default Loading;
