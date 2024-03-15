/*
  Warnings:

  - Added the required column `desiredCompanies` to the `candidate_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programmingLanguages` to the `candidate_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `technologiesUsed` to the `candidate_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "candidate_info" ADD COLUMN     "desiredCompanies" TEXT NOT NULL,
ADD COLUMN     "programmingLanguages" TEXT NOT NULL,
ADD COLUMN     "technologiesUsed" TEXT NOT NULL;
