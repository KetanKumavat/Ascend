import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
    try {
        const { meetingId, speaker, text, isFinal } = await request.json();

        if (!meetingId || !text?.trim()) {
            return NextResponse.json(
                { error: "Meeting ID and text are required" },
                { status: 400 }
            );
        }

        const rawSegment = await db.transcriptSegment.create({
            data: {
                meetingId,
                speaker: speaker || "Unknown",
                content: text.trim(),
                type: "RAW",
                isFinal: Boolean(isFinal),
                timestamp: new Date(),
            },
        });

        if (isFinal) {
            await processTranscriptWithAI(meetingId, rawSegment);
        }

        return NextResponse.json({ success: true, segmentId: rawSegment.id });
    } catch (error) {
        console.error("Transcription processing error:", error);
        return NextResponse.json(
            { error: "Failed to process transcription" },
            { status: 500 }
        );
    }
}

async function processTranscriptWithAI(meetingId, latestSegment) {
    try {
        const allSegments = await db.transcriptSegment.findMany({
            where: {
                meetingId,
                type: "RAW",
                isFinal: true,
            },
            orderBy: { timestamp: "asc" },
        });

        if (allSegments.length < 3) {
            console.log("Not enough transcript segments for AI processing yet");
            return;
        }

        const fullTranscript = allSegments
            .map((seg) => `${seg.speaker}: ${seg.content}`)
            .join("\n");

        if (process.env.GEMINI_API_KEY === "demo_key") {
            await createMockAIProcessing(meetingId, fullTranscript);
            return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const summaryPrompt = `Analyze this meeting transcript and provide a concise summary (2-3 sentences):

${fullTranscript}

Summary:`;

        const highlightsPrompt = `Extract 3-5 key highlights from this meeting transcript. Return as a JSON array of strings:

${fullTranscript}

Key highlights (JSON array):`;

        const [summaryResult, highlightsResult] = await Promise.all([
            model.generateContent(summaryPrompt),
            model.generateContent(highlightsPrompt),
        ]);

        const summary = summaryResult.response.text().trim();
        let highlights = [];

        try {
            const highlightsText = highlightsResult.response.text().trim();
            highlights = JSON.parse(
                highlightsText.replace(/```json\n?|\n?```/g, "")
            );
        } catch (e) {
            highlights = highlightsResult.response
                .text()
                .split("\n")
                .filter(
                    (line) =>
                        line.trim().startsWith("-") ||
                        line.trim().startsWith("•")
                )
                .map((line) => line.replace(/^[-•]\s*/, "").trim())
                .filter((line) => line.length > 0);
        }

        await Promise.all([
            db.transcriptSegment.create({
                data: {
                    meetingId,
                    speaker: "AI",
                    content: summary,
                    type: "SUMMARY",
                    isFinal: true,
                    timestamp: new Date(),
                },
            }),
            db.transcriptSegment.create({
                data: {
                    meetingId,
                    speaker: "AI",
                    content: JSON.stringify(highlights),
                    type: "HIGHLIGHTS",
                    isFinal: true,
                    timestamp: new Date(),
                },
            }),
        ]);

        console.log(`AI processing completed for meeting ${meetingId}`);
    } catch (error) {
        console.error("AI processing error:", error);
    }
}

async function createMockAIProcessing(meetingId, fullTranscript) {
    const mockSummary =
        "This meeting covered project progress, discussed upcoming milestones, and identified key action items for the team to complete.";

    const mockHighlights = [
        "Reviewed current sprint progress and deliverables",
        "Discussed technical challenges and potential solutions",
        "Identified resource needs for upcoming features",
        "Scheduled follow-up meetings for stakeholder alignment",
    ];

    await Promise.all([
        db.transcriptSegment.create({
            data: {
                meetingId,
                speaker: "AI",
                content: mockSummary,
                type: "SUMMARY",
                isFinal: true,
                timestamp: new Date(),
            },
        }),
        db.transcriptSegment.create({
            data: {
                meetingId,
                speaker: "AI",
                content: JSON.stringify(mockHighlights),
                type: "HIGHLIGHTS",
                isFinal: true,
                timestamp: new Date(),
            },
        }),
    ]);
}
