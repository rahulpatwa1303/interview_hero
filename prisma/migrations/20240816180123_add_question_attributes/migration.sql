/*
  Warnings:

  - You are about to drop the column `question_attributes` on the `interview_question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "interview_question" DROP COLUMN "question_attributes",
ADD COLUMN     "categoryCode" INTEGER,
ADD COLUMN     "codingRequired" BOOLEAN,
ADD COLUMN     "score" INTEGER;
