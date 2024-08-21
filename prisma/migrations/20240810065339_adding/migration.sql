-- CreateTable
CREATE TABLE "interview" (
    "id" SERIAL NOT NULL,
    "interview_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),

    CONSTRAINT "interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_question" (
    "id" SERIAL NOT NULL,
    "interview_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "submit_on" TIMESTAMP(3) NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_info" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "yoe" TEXT NOT NULL,
    "progLang" TEXT[],
    "currentRole" TEXT NOT NULL,
    "desiredRole" TEXT NOT NULL,
    "interestedTechnology" TEXT[],
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_interview_id_key" ON "interview"("interview_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_info_userId_key" ON "candidate_info"("userId");

-- AddForeignKey
ALTER TABLE "interview_question" ADD CONSTRAINT "interview_question_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_info" ADD CONSTRAINT "candidate_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
