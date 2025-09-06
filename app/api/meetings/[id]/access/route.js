import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const meetingId = resolvedParams.id;

        // Get the meeting with project and organization info
        const meeting = await db.meeting.findFirst({
            where: { id: meetingId },
            include: {
                project: {
                    include: {
                        organization: {
                            include: {
                                memberships: {
                                    where: { userId },
                                    select: { role: true },
                                },
                            },
                        },
                    },
                },
                participants: true,
            },
        });

        if (!meeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        // Check if user is member of the organization
        const membership = meeting.project.organization.memberships[0];
        if (!membership) {
            return NextResponse.json(
                { error: "Not a member of this organization" },
                { status: 403 }
            );
        }

        // For Google Meet codes, allow all members to see them
        // even if they're not admin
        const canViewMeetCode =
            meeting.meetingUrl &&
            (membership.role === "ADMIN" ||
                meeting.participants.some((p) => p.userId === userId) ||
                meeting.project.organization.memberships.length > 0); // Member of org

        if (!canViewMeetCode) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Extract Google Meet code from URL if it's a Google Meet link
        let meetCode = null;
        if (meeting.meetingUrl) {
            const googleMeetMatch = meeting.meetingUrl.match(
                /meet\.google\.com\/([a-z-]+)/
            );
            if (googleMeetMatch) {
                meetCode = googleMeetMatch[1];
            }
        }

        return NextResponse.json({
            id: meeting.id,
            title: meeting.title,
            meetingUrl: meeting.meetingUrl,
            meetCode,
            canJoin: true,
            isParticipant: meeting.participants.some(
                (p) => p.userId === userId
            ),
            isAdmin: membership.role === "ADMIN",
        });
    } catch (error) {
        console.error("Error fetching meeting access:", error);
        return NextResponse.json(
            { error: "Failed to check meeting access" },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const resolvedParams = await params;
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const meetingId = resolvedParams.id;

        // Get the meeting
        const meeting = await db.meeting.findFirst({
            where: { id: meetingId },
            include: {
                project: {
                    include: {
                        organization: {
                            include: {
                                memberships: {
                                    where: { userId },
                                    select: { role: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!meeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        // Check if user is member of the organization
        const membership = meeting.project.organization.memberships[0];
        if (!membership) {
            return NextResponse.json(
                { error: "Not a member of this organization" },
                { status: 403 }
            );
        }

        // Return the meeting URL for joining
        return NextResponse.json({
            meetingUrl: meeting.meetingUrl,
            success: true,
        });
    } catch (error) {
        console.error("Error joining meeting:", error);
        return NextResponse.json(
            { error: "Failed to join meeting" },
            { status: 500 }
        );
    }
}
