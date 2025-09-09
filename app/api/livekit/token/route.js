import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(request) {
    try {
        const { roomName, participantName, participantMetadata } =
            await request.json();

        if (!roomName || !participantName) {
            return NextResponse.json(
                { error: "Room name and participant name are required" },
                { status: 400 }
            );
        }

        const livekitHost = process.env.LIVEKIT_WS_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!livekitHost || !apiKey || !apiSecret) {
            console.error("LiveKit environment variables not configured:");
            console.error("LIVEKIT_WS_URL:", !!livekitHost);
            console.error("LIVEKIT_API_KEY:", !!apiKey);
            console.error("LIVEKIT_API_SECRET:", !!apiSecret);
            return NextResponse.json(
                { error: "LiveKit not configured - missing environment variables" },
                { status: 500 }
            );
        }

        // Create access token
        const token = new AccessToken(apiKey, apiSecret, {
            identity: participantName,
            ttl: "10m",
        });

        // Grant permissions
        token.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
            canUpdateOwnMetadata: true,
        });

        // Set participant metadata if provided
        if (participantMetadata) {
            token.metadata = participantMetadata;
        }

        const jwt = await token.toJwt();

        return NextResponse.json({
            token: jwt,
            serverUrl: livekitHost,
            participantName,
            roomName,
        });
    } catch (error) {
        console.error("Error generating LiveKit token:", error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}
