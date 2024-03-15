import React from 'react'

function Loading() {
  return (
    <div className="w-full h-full flex justify-center items-center text-light-onSurface dark:text-dark-onSurface animate-pulse">
      <div className=" p-6 rounded-lg flex justify-center items-center flex-col bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest shadow-lg drop-shadow-md h-40 w-96"></div>
    </div>
  )
}

export default Loading