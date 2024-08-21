import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { redirect } from "next/navigation";
import { generateInterview } from "./helper";

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const interviewId: string | number = req.nextUrl.searchParams.get("id")!;
  const loggedUser = await getToken({ req: req, secret });
  const isUser = await prisma.user.findUnique({
    where: {
      email: loggedUser?.email!,
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
    const url = req.nextUrl.clone();
    url.pathname = `/interview/${interviewId}/wait_room`;

    return NextResponse.rewrite(url);
  } else {
    const url = req.nextUrl.clone();
    url.pathname = `/interview/${interviewId}/wait_room/error`;

    return NextResponse.rewrite(url);
  }
}
