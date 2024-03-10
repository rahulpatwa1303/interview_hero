/*
  Warnings:

  - You are about to drop the `programingLanguage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "programingLanguage";

-- CreateTable
CREATE TABLE "programing_language" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "programing_language_pkey" PRIMARY KEY ("id")
);
