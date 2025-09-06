import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Public token is required" },
        { status: 400 }
      );
    }

    // Find meeting by public token
    const meeting = await db.meeting.findUnique({
      where: { 
        publicToken: token,
        isPublic: true,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found or not publicly accessible" },
        { status: 404 }
      );
    }

    // Return meeting info (without sensitive data)
    const publicMeetingInfo = {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      status: meeting.status,
      scheduledAt: meeting.scheduledAt,
      duration: meeting.duration,
      participants: meeting.participants.map(p => ({
        name: p.user.name || p.user.email,
        status: p.status,
      })),
      project: meeting.project,
    };

    return NextResponse.json(publicMeetingInfo);
  } catch (error) {
    console.error("Get public meeting error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
