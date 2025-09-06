import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { AccessToken } from "livekit-server-sdk";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { token } = resolvedParams;
    const { participantName } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Public token is required" },
        { status: 400 }
      );
    }

    if (!participantName || participantName.trim().length === 0) {
      return NextResponse.json(
        { error: "Participant name is required" },
        { status: 400 }
      );
    }

    // Find meeting by public token
    const meeting = await db.meeting.findUnique({
      where: { 
        publicToken: token,
        isPublic: true,
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found or not publicly accessible" },
        { status: 404 }
      );
    }

    // Check if meeting is active or scheduled
    if (meeting.status === 'COMPLETED' || meeting.status === 'CANCELLED') {
      return NextResponse.json(
        { error: "Meeting has ended or been cancelled" },
        { status: 410 }
      );
    }

    // Generate LiveKit token for public participant
    const livekitToken = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: participantName.trim(),
      }
    );

    // Grant permissions
    livekitToken.addGrant({
      room: meeting.livekitRoomName || meeting.id,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token_jwt = await livekitToken.toJwt();
    const serverUrl = process.env.LIVEKIT_WS_URL;

    // Update meeting status to IN_PROGRESS if it's still scheduled
    if (meeting.status === 'SCHEDULED') {
      await db.meeting.update({
        where: { id: meeting.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json({
      token: token_jwt,
      serverUrl,
      meetingId: meeting.id,
      roomName: meeting.livekitRoomName || meeting.id,
      participantName: participantName.trim(),
    });
  } catch (error) {
    console.error("Join public meeting error:", error);
    return NextResponse.json(
      { error: "Failed to join meeting" },
      { status: 500 }
    );
  }
}
