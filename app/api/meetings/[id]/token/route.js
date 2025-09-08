import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AccessToken } from "livekit-server-sdk";
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

        const meetingId = resolvedParams.id;

        // Parse request body safely
        let participantName = null;
        try {
            const body = await request.json();
            participantName = body.participantName;
        } catch (e) {
            // No JSON body or parsing error - continue with default
            console.log("No JSON body provided or parsing error:", e.message);
        }

        // First check if meeting exists at all
        const meetingExists = await db.meeting.findUnique({
            where: { id: meetingId },
            select: { id: true, organizationId: true, isPublic: true },
        });

        console.log("Meeting exists check:", meetingExists ? "Yes" : "No");
        if (!meetingExists) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        // Check if user has access (either same org or public meeting)
        const hasAccess =
            meetingExists.organizationId === orgId || meetingExists.isPublic;

        if (!hasAccess) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Get full meeting details
        const meeting = await db.meeting.findUnique({
            where: { id: meetingId },
            include: {
                project: true,
            },
        });

        // Get user info for participant name
        const user = await db.user.findFirst({
            where: { clerkUserId: userId },
        });

        const participantDisplayName =
            participantName || user?.name || "Anonymous";

        // Check if LiveKit environment variables are set
        if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
            console.error("Missing LiveKit environment variables");
            return NextResponse.json(
                { error: "LiveKit not configured" },
                { status: 500 }
            );
        }

        // Create LiveKit access token with unique identity
        const uniqueIdentity = `${userId}_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        const token = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: uniqueIdentity, // Use unique identity to prevent conflicts
                name: participantDisplayName,
                ttl: "2h", // Token valid for 2 hours
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
