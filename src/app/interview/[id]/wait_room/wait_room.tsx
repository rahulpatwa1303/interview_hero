"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

function WaitRoom() {
  const path = usePathname();
  const interviewId = path?.split("/")[2];
  const [valueExists, setValueExists] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkValue = async () => {
      try {
        const response = await fetch(
          `/api/interview/question_check?id=${interviewId}`
        );
        if (response.ok) {
          const data = await response.json();
          // Assuming the API response indicates whether the value exists
          if (data.exists) {
            setValueExists(true);
            // Stop checking once the value is found
            clearInterval(intervalId);
          }
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        setError(error.message);
      }
    };

    // Check value every 0.5 seconds
    const intervalId = setInterval(checkValue, 500);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {valueExists ? <div>Value exists!</div> : <div>Please wait for it</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}

export default WaitRoom;
