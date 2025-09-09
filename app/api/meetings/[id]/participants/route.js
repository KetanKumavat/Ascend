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
        const meetingId = resolvedParams.id;

        if (!status || !["JOINED", "LEFT"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Get user record
        const user = await db.user.findFirst({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Update participant status
        await db.meetingParticipant.upsert({
            where: {
                meetingId_userId: {
                    meetingId: meetingId,
                    userId: user.id,
                },
            },
            update: {
                status: status,
                leftAt: status === "LEFT" ? new Date() : null,
            },
            create: {
                meetingId: meetingId,
                userId: user.id,
                status: status,
                joinedAt: status === "JOINED" ? new Date() : null,
                leftAt: status === "LEFT" ? new Date() : null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating participant status:", error);
        return NextResponse.json(
            { error: "Failed to update participant status" },
            { status: 500 }
        );
    }
}
