-- CreateEnum
CREATE TYPE "InterviewSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FALLBACK', 'ABANDONED');

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "InterviewSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "filledFields" JSONB NOT NULL DEFAULT '{}',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "credited" BOOLEAN NOT NULL DEFAULT false,
    "creditsCharged" INTEGER NOT NULL DEFAULT 0,
    "reservationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_sessions_userId_createdAt_idx" ON "interview_sessions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "interview_sessions_userId_status_idx" ON "interview_sessions"("userId", "status");

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
