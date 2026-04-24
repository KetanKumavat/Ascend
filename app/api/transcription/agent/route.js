import { NextResponse } from "next/server";

export async function POST(request) {
    return NextResponse.json(
        {
            success: false,
            message: "Transcription is temporarily disabled",
        },
        { status: 503 },
    );
}

export async function GET(request) {
    return NextResponse.json({
        isActive: false,
        activeAgents: 0,
        message: "Transcription is temporarily disabled",
    });
}
