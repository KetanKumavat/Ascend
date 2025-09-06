import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AccessToken } from "livekit-server-sdk";
import { db } from "@/lib/prisma";

export async function POST(request, { params }) {
    try {
        const resolvedParams = await params;
        const { userId, orgId } = await auth();
        if (!userId || !orgId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const meetingId = resolvedParams.id;
        const { participantName } = await request.json();

        // Verify meeting exists and user has access
        const meeting = await db.meeting.findFirst({
            where: {
                id: meetingId,
                organizationId: orgId,
            },
            include: {
                project: true,
            },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        // Get user info for participant name
        const user = await db.user.findFirst({
            where: { clerkUserId: userId },
        });

        const participantDisplayName = participantName || user?.name || "Anonymous";

        // Create LiveKit access token
        const token = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: userId,
                name: participantDisplayName,
                ttl: '2h', // Token valid for 2 hours
            }
        );

        // Grant permissions - using meetingId as room name
        token.addGrant({
            room: meetingId,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true, // For transcription data
            canUpdateOwnMetadata: true,
        });

        const accessToken = await token.toJwt();

        console.log('Generated token for:', {
            meetingId,
            userId,
            participantName: participantDisplayName,
            wsUrl: process.env.LIVEKIT_WS_URL
        });

        // Record participant joining
        await db.meetingParticipant.upsert({
            where: {
                meetingId_userId: {
                    meetingId: meetingId,
                    userId: user?.id || userId,
                },
            },
            update: {
                status: "JOINED",
                joinedAt: new Date(),
            },
            create: {
                meetingId: meetingId,
                userId: user?.id || userId,
                status: "JOINED",
                joinedAt: new Date(),
            },
        });

        return NextResponse.json({
            token: accessToken,
            serverUrl: process.env.LIVEKIT_WS_URL,
            roomName: meetingId,
            participantName: participantDisplayName,
        });
    } catch (error) {
        console.error("Error generating LiveKit token:", error);
        return NextResponse.json(
            { error: "Failed to generate access token" },
            { status: 500 }
        );
    }
}
