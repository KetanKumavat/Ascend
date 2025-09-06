import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { status } = await request.json();
    
    if (!status || !["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
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

    // Update meeting status
    const updatedMeeting = await db.meeting.update({
      where: { id: resolvedParams.id },
      data: { 
        status: status,
        // Update timestamp when status changes
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ 
      success: true, 
      meeting: updatedMeeting 
    });

  } catch (error) {
    console.error("Update meeting status error:", error);
    return NextResponse.json(
      { error: "Failed to update meeting status" },
      { status: 500 }
    );
  }
}
