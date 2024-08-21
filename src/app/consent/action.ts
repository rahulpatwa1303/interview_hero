"use server";

import prisma from "../../../prisma";

export const createInterview = async (sessionID: string) => {
  try {
    const interview = await prisma.interview.create({
      data: {
        interview_id: sessionID,
        // Optionally add more fields if needed
      },
    });
    return interview;
  } catch (error) {
    console.error("Error creating interview:", error);
    throw error;
  }
};
