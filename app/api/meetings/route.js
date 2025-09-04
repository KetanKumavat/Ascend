import { NextResponse } from "next/server";
import { createMeeting, getMeetings } from "@/actions/meetings";

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.scheduledAt) {
      return NextResponse.json(
        { error: "Title and scheduled time are required" },
        { status: 400 }
      );
    }

    const meeting = await createMeeting(data);
    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Meeting creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const meetings = await getMeetings(projectId);
    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Get meetings error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
