-- DropForeignKey
ALTER TABLE "interview_question" DROP CONSTRAINT "interview_question_interviewId_fkey";

-- AlterTable
ALTER TABLE "interview_question" ADD COLUMN     "interviewSessionId" INTEGER,
ALTER COLUMN "interviewId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "interview_question" ADD CONSTRAINT "interview_question_interviewSessionId_fkey" FOREIGN KEY ("interviewSessionId") REFERENCES "InterviewSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
