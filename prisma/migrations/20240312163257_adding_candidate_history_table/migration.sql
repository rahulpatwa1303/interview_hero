/*
  Warnings:

  - You are about to drop the column `candidate_historyId` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `candidate_historyId` on the `programing_language` table. All the data in the column will be lost.
  - You are about to drop the column `candidate_historyId` on the `technology_used` table. All the data in the column will be lost.
  - You are about to drop the `candidate_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_candidate_historyId_fkey";

-- DropForeignKey
ALTER TABLE "programing_language" DROP CONSTRAINT "programing_language_candidate_historyId_fkey";

-- DropForeignKey
ALTER TABLE "technology_used" DROP CONSTRAINT "technology_used_candidate_historyId_fkey";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "candidate_historyId",
ADD COLUMN     "candidate_infoId" INTEGER;

-- AlterTable
ALTER TABLE "programing_language" DROP COLUMN "candidate_historyId",
ADD COLUMN     "candidate_infoId" INTEGER;

-- AlterTable
ALTER TABLE "technology_used" DROP COLUMN "candidate_historyId",
ADD COLUMN     "candidate_infoId" INTEGER;

-- DropTable
DROP TABLE "candidate_history";

-- CreateTable
CREATE TABLE "candidate_info" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "yoe" INTEGER NOT NULL,
    "currentRole" TEXT NOT NULL,
    "desiredRole" TEXT,
    "interviewId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "duration" TEXT,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_info_interviewId_key" ON "candidate_info"("interviewId");

-- AddForeignKey
ALTER TABLE "programing_language" ADD CONSTRAINT "programing_language_candidate_infoId_fkey" FOREIGN KEY ("candidate_infoId") REFERENCES "candidate_info"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_candidate_infoId_fkey" FOREIGN KEY ("candidate_infoId") REFERENCES "candidate_info"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technology_used" ADD CONSTRAINT "technology_used_candidate_infoId_fkey" FOREIGN KEY ("candidate_infoId") REFERENCES "candidate_info"("id") ON DELETE SET NULL ON UPDATE CASCADE;
