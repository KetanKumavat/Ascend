import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content, timestamp, chunkId } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Verify meeting access
    const meeting = await db.meeting.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!meeting || meeting.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Meeting not found or access denied" },
        { status: 404 }
      );
    }

    // Update or create partial transcript
    const partialTranscript = await db.meetingTranscript.upsert({
      where: { meetingId: resolvedParams.id },
      create: {
        meetingId: resolvedParams.id,
        content: content,
        highlights: JSON.stringify({
          isPartial: true,
          lastSaved: timestamp,
          chunkId: chunkId,
          autoSaveCount: 1
        })
      },
      update: {
        content: content,
        highlights: JSON.stringify({
          isPartial: true,
          lastSaved: timestamp,
          chunkId: chunkId,
          autoSaveCount: (() => {
            if (!meeting.transcript?.highlights) return 1;
            try {
              return JSON.parse(meeting.transcript.highlights).autoSaveCount + 1;
            } catch (error) {
              console.warn('Invalid JSON in transcript highlights, resetting count:', error);
              return 1;
            }
          })()
        })
      },
    });

    // Update meeting status to IN_PROGRESS if not already
    if (meeting.status === "SCHEDULED") {
      await db.meeting.update({
        where: { id: params.id },
        data: { status: "IN_PROGRESS" }
      });
    }

    return NextResponse.json({ 
      success: true, 
      transcriptId: partialTranscript.id,
      saved: true 
    });

  } catch (error) {
    console.error("Auto-save transcript error:", error);
    return NextResponse.json(
      { error: "Failed to auto-save transcript" },
      { status: 500 }
    );
  }
}
