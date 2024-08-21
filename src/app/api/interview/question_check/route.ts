import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";

export async function GET(req: NextRequest) {
  const interviewId: string | number = req.nextUrl.searchParams.get("id")!;

  const interviewIdPK = await prisma.interview.findUnique({
    where: {
      interview_id: interviewId,
    },
  });

  const isQuestionReady = !!(await prisma.interview_question.findFirst({
    where: {
      interview_id: interviewIdPK?.id,
    },
  }));

  return NextResponse.json({ question_ready: isQuestionReady });
}
