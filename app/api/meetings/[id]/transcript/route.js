import { NextResponse } from "next/server";
import { addMeetingTranscript } from "@/actions/meetings";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { transcript } = await request.json();
    
    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript content is required" },
        { status: 400 }
      );
    }

    const result = await addMeetingTranscript(resolvedParams.id, transcript);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Add transcript error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    const meetingId = resolvedParams.id;

    // Get the meeting and transcript with segments
    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: {
        transcript: {
          include: {
            segments: {
              orderBy: {
                timestamp: 'asc',
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Verify user has access to this meeting/organization
    if (meeting.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Return transcript data or empty structure if no transcript exists yet
    const transcriptData = meeting.transcript || {
      meetingId,
      content: "",
      segments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(transcriptData);
  } catch (error) {
    console.error("Get transcript error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
