/*
  Warnings:

  - Added the required column `question_attributes` to the `interview_question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "interview_question" ADD COLUMN     "question_attributes" JSONB NOT NULL;
