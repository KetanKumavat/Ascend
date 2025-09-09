import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(request, { params }) {
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

        // Count active participants (those who joined but haven't left)
        const activeCount = await db.meetingParticipant.count({
            where: {
                meetingId: meetingId,
                status: "JOINED",
                leftAt: null,
            },
        });

        // Count total participants who ever joined
        const totalCount = await db.meetingParticipant.count({
            where: {
                meetingId: meetingId,
            },
        });

        return NextResponse.json({
            activeCount,
            totalCount,
        });
    } catch (error) {
        console.error("Error getting participant count:", error);
        return NextResponse.json(
            { error: "Failed to get participant count" },
            { status: 500 }
        );
    }
}
