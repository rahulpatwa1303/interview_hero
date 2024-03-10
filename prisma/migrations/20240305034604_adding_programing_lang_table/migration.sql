/*
  Warnings:

  - You are about to drop the `ProgramingLanguage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ProgramingLanguage";

-- CreateTable
CREATE TABLE "programingLanguage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "programingLanguage_pkey" PRIMARY KEY ("id")
);
