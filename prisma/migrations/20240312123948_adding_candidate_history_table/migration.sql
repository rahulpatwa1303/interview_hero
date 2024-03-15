-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "candidate_historyId" INTEGER;

-- AlterTable
ALTER TABLE "programing_language" ADD COLUMN     "candidate_historyId" INTEGER;

-- AlterTable
ALTER TABLE "technology_used" ADD COLUMN     "candidate_historyId" INTEGER;

-- CreateTable
CREATE TABLE "candidate_history" (
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

    CONSTRAINT "candidate_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_history_interviewId_key" ON "candidate_history"("interviewId");

-- AddForeignKey
ALTER TABLE "programing_language" ADD CONSTRAINT "programing_language_candidate_historyId_fkey" FOREIGN KEY ("candidate_historyId") REFERENCES "candidate_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_candidate_historyId_fkey" FOREIGN KEY ("candidate_historyId") REFERENCES "candidate_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technology_used" ADD CONSTRAINT "technology_used_candidate_historyId_fkey" FOREIGN KEY ("candidate_historyId") REFERENCES "candidate_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;
