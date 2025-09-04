import { NextResponse } from "next/server";
import { addMeetingTranscript } from "@/actions/meetings";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const { transcript } = await request.json();
    
    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript content is required" },
        { status: 400 }
      );
    }

    const result = await addMeetingTranscript(params.id, transcript);
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
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    const meeting = await db.meeting.findUnique({
      where: { id: params.id },
      include: {
        transcript: true,
      },
    });

    if (!meeting || meeting.organizationId !== orgId) {
      return NextResponse.json(
        { error: "Meeting not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting.transcript);
  } catch (error) {
    console.error("Get transcript error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
