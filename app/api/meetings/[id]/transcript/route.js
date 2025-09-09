import { NextResponse } from "next/server";
import { addMeetingTranscript } from "@/actions/meetings";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(request, { params }) {
    try {
        const resolvedParams = await params;
        const { transcript } = await request.json();

        if (!transcript) {
            return NextResponse.json(
                { error: "Transcript content is required" },
                { status: 400 }
            );
        }

        const result = await addMeetingTranscript(
            resolvedParams.id,
            transcript
        );
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Add transcript error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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

        // Get the meeting to verify access
        const meeting = await db.meeting.findUnique({
            where: { id: meetingId },
            select: { organizationId: true },
        });

        if (!meeting) {
            return NextResponse.json(
                { error: "Meeting not found" },
                { status: 404 }
            );
        }

        // Verify user has access to this meeting/organization
        if (meeting.organizationId !== orgId) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Get transcript segments using the new schema
        const transcriptSegments = await db.transcriptSegment.findMany({
            where: {
                meetingId: meetingId,
            },
            orderBy: {
                timestamp: "asc",
            },
        });

        if (!transcriptSegments || transcriptSegments.length === 0) {
            return NextResponse.json({
                meetingId,
                content: "No transcript available",
                summary: null,
                highlights: [],
                actionItems: [],
                speakers: [],
                duration: 0,
                createdAt: new Date(),
            });
        }

        const rawSegments = transcriptSegments.filter(
            (seg) => seg.type === "RAW"
        );
        const summarySegment = transcriptSegments.find(
            (seg) => seg.type === "SUMMARY"
        );
        const highlightsSegment = transcriptSegments.find(
            (seg) => seg.type === "HIGHLIGHTS"
        );

        let fullContent = "";
        let speakers = new Set();

        if (rawSegments.length > 0) {
            fullContent = rawSegments
                .map((segment) => {
                    const timestamp = segment.timestamp.toLocaleTimeString();
                    speakers.add(segment.speaker);
                    return `[${timestamp}] ${segment.speaker}: ${segment.content}`;
                })
                .join("\n");
        }

        let highlights = [];
        try {
            if (highlightsSegment?.content) {
                highlights = JSON.parse(highlightsSegment.content);
            }
        } catch (e) {
            console.error("Error parsing highlights:", e);
        }

        const response = {
            meetingId,
            content: fullContent || "No transcript available",
            summary: summarySegment?.content || null,
            highlights: highlights,
            actionItems: [], // Can be extracted from processed content later
            speakers: Array.from(speakers),
            duration: Math.ceil((rawSegments.length * 10) / 60), // Rough estimate
            createdAt: rawSegments[0]?.timestamp || new Date(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Get transcript error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
