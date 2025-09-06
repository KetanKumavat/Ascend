import { NextResponse } from "next/server";
import { getMeeting, updateMeetingStatus, deleteMeeting } from "@/actions/meetings";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const meeting = await getMeeting(resolvedParams.id);
    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Get meeting error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const meeting = await updateMeetingStatus(resolvedParams.id, status);
    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Update meeting error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const result = await deleteMeeting(resolvedParams.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Delete meeting error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
