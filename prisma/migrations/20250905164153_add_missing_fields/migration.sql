/*
  Warnings:

  - Added the required column `updatedAt` to the `MeetingTranscript` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'JOINED', 'LEFT', 'DECLINED');

-- AlterTable
ALTER TABLE "MeetingParticipant" ADD COLUMN     "status" "ParticipantStatus" NOT NULL DEFAULT 'INVITED';

-- AlterTable - Add updatedAt with default value for existing rows
ALTER TABLE "MeetingTranscript" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- CreateIndex
CREATE INDEX "idx_meeting_participant_status" ON "MeetingParticipant"("status");
