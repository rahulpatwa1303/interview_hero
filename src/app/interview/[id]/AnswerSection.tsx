"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { LuMic } from "react-icons/lu";
import { motion } from "framer-motion";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => {
    const delay = 1 + i * 0.5;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

function AnswerSection(props) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  return (
    <div>
      <motion.svg
        width="40"
        height="40"
        viewBox="0 0 70 40"
        initial="hidden"
        animate="visible"
        
      >
        <motion.line
          x1="0"
          x2="40"
          stroke="#00cc88"
          rotate={180}
          variants={draw}
          custom={0.5}
          strokeWidth={4}
          strokeLinejoin={'round'}
        />
        <motion.line
          x1="0"
          y1="10"
          y2="10"
          x2="40"
          stroke="#00cc88"
          rotate={180}
          variants={draw}
          custom={1}
          strokeWidth={4}
          strokeLinejoin={'round'}
        />
        <motion.line
          x1="0"
          y1="20"
          y2="20"
          x2="30"
          stroke="#00cc88"
          rotate={180}
          variants={draw}
          custom={1.5}
          strokeWidth={4}
          strokeLinejoin={'round'}
        />
      </motion.svg>
      <Button
        onClick={SpeechRecognition.startListening}
        className="bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primary/70 hover:dark:bg-dark-primary/70 disabled:bg-light-onSurface/50 dark:disabled:bg-dark-onSurface/50 disabled:text-bg-light-onSurface dark:disabled:text-bg-dark-onSurface"
      >
        <LuMic className="mr-2" /> Answer
      </Button>
      {/* <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button> */}
      <p>{transcript}</p>
    </div>
  );
}

export { AnswerSection };
