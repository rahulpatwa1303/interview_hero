/*
  Warnings:

  - You are about to drop the column `candidate_infoId` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `candidate_infoId` on the `programing_language` table. All the data in the column will be lost.
  - You are about to drop the column `candidate_infoId` on the `technology_used` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_candidate_infoId_fkey";

-- DropForeignKey
ALTER TABLE "programing_language" DROP CONSTRAINT "programing_language_candidate_infoId_fkey";

-- DropForeignKey
ALTER TABLE "technology_used" DROP CONSTRAINT "technology_used_candidate_infoId_fkey";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "candidate_infoId";

-- AlterTable
ALTER TABLE "programing_language" DROP COLUMN "candidate_infoId";

-- AlterTable
ALTER TABLE "technology_used" DROP COLUMN "candidate_infoId";

-- CreateTable
CREATE TABLE "interview_question" (
    "id" SERIAL NOT NULL,
    "interviewId" INTEGER NOT NULL,
    "time" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "queston" TEXT NOT NULL,
    "answer" TEXT,
    "answerScore" INTEGER,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "interview_question" ADD CONSTRAINT "interview_question_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
