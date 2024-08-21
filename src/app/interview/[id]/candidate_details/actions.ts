"use server";
import { getToken } from "next-auth/jwt";
import prisma from "../../../../../prisma";
import { generateInterview } from "@/app/api/interview/candidate_info/helper";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/auth";

const secret = process.env.NEXTAUTH_SECRET;

export const createUser = async ({ req, id }: { req: any; id: string }) => {
  const body = req;
  const interviewId: string | number = id;
  const loggedUser = await getServerSession(authOptions);
  const isUser = await prisma.user.findUnique({
    where: {
      email: loggedUser?.user?.email!,
    },
  });

  if (isUser) {
    // If the user exists, update the candidate_info
    await prisma.candidate_info.upsert({
      where: {
        userId: isUser.id,
      },
      update: {
        ...body,
      },
      create: {
        userId: isUser.id,
        ...body,
      },
    });
  } else {
    // If the user does not exist, create a new candidate_info
    await prisma.candidate_info.create({
      data: {
        ...body,
      },
    });
  }

  // Generate interview and redirect
  const genAISuccess: boolean = await generateInterview({
    formData: body,
    interviewId: interviewId,
  });
  if (genAISuccess) {
    let url = `/interview/${interviewId}/wait_room`;

    return redirect(url);
  } else {
    let url = `/interview/${interviewId}/wait_room/error`;

    return redirect(url);
  }
};
