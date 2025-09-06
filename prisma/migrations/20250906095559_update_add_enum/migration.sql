-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "externalPlatform" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MeetingTranscript" ADD COLUMN     "actionItems" TEXT,
ADD COLUMN     "audioPath" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "processing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "speakers" TEXT,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "participantId" TEXT,
    "text" TEXT NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_segment_meeting_id" ON "TranscriptSegment"("meetingId");

-- CreateIndex
CREATE INDEX "idx_segment_timestamp" ON "TranscriptSegment"("timestamp");

-- CreateIndex
CREATE INDEX "idx_segment_is_final" ON "TranscriptSegment"("isFinal");

-- CreateIndex
CREATE INDEX "idx_meeting_is_external" ON "Meeting"("isExternal");

-- CreateIndex
CREATE INDEX "idx_transcript_processing" ON "MeetingTranscript"("processing");

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "MeetingTranscript"("meetingId") ON DELETE CASCADE ON UPDATE CASCADE;
