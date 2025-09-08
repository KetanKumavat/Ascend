import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createApiRoute } from "@/lib/api-middleware";
import { revalidateTag } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function handleTranscriptionWebhook(request) {
    const data = await request.json();

    console.log("LiveKit transcription webhook received:", data);

    if (data.event === "transcription_complete") {
        await handleTranscriptionComplete(data);
    } else if (data.event === "transcription_segment") {
        await handleTranscriptionSegment(data);
    }

    return NextResponse.json({ success: true });
}

// Export the optimized route with performance monitoring
export const POST = createApiRoute(handleTranscriptionWebhook, {
    routeName: "livekit-transcription",
    rateLimit: {
        windowMs: 60000, // 1 minute
        maxRequests: 100, // Allow 100 transcription events per minute
    },
});

async function handleTranscriptionSegment(data) {
    const { room_name, participant_id, text, is_final, language } = data;

    const meetingId = room_name.split("-")[1];

    if (!meetingId) {
        console.error(
            "Could not extract meeting ID from room name:",
            room_name
        );
        return;
    }

    try {
        // Store real-time transcript segment in database with upsert for better performance
        await db.transcriptSegment.upsert({
            where: {
                meetingId_participantId_timestamp: {
                    meetingId,
                    participantId: participant_id,
                    timestamp: new Date(),
                },
            },
            update: {
                text,
                isFinal: is_final,
                language: language || "en",
            },
            create: {
                meetingId,
                participantId: participant_id,
                text,
                isFinal: is_final,
                language: language || "en",
                timestamp: new Date(),
            },
        });

        console.log(
            "Transcript segment stored for meeting:",
            meetingId
        );
    } catch (error) {
        console.error("Error storing transcript segment:", error);
        // Use fallback create if upsert fails due to schema differences
        try {
            await db.transcriptSegment.create({
                data: {
                    meetingId,
                    participantId: participant_id,
                    text,
                    isFinal: is_final,
                    language: language || "en",
                    timestamp: new Date(),
                },
            });
        } catch (fallbackError) {
            console.error(
                "Fallback create also failed:",
                fallbackError
            );
        }
    }
}

async function handleTranscriptionComplete(data) {
    const { room_name, transcript, duration, participants } = data;

    // Extract meeting ID from room name
    const meetingId = room_name.split("-")[1];

    if (!meetingId) {
        console.error(
            "Could not extract meeting ID from room name:",
            room_name
        );
        return;
    }

    try {
        // Batch operations for better performance
        const [meeting, aiAnalysis] = await Promise.all([
            // Get meeting details with minimal select
            db.meeting.findUnique({
                where: { id: meetingId },
                select: {
                            id: true,
                            title: true,
                            status: true,
                            project: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    }),
                    // Generate AI summary in parallel
                    generateAISummary(
                        transcript,
                        room_name.includes("meeting") ? "Meeting" : "Discussion"
                    ),
                ]);

                if (!meeting) {
                    console.error("Meeting not found:", meetingId);
                    return;
                }

                // Batch database operations
                const [savedTranscript] = await Promise.all([
                    // Save complete transcript to database
                    db.meetingTranscript.upsert({
                        where: { meetingId },
                        update: {
                            content: transcript,
                            summary: aiAnalysis.summary,
                            highlights: JSON.stringify(aiAnalysis.highlights),
                            actionItems: JSON.stringify(aiAnalysis.actionItems),
                            speakers: JSON.stringify(aiAnalysis.speakers),
                            duration: duration,
                            processing: false,
                            updatedAt: new Date(),
                        },
                        create: {
                            meetingId,
                            content: transcript,
                            summary: aiAnalysis.summary,
                            highlights: JSON.stringify(aiAnalysis.highlights),
                            actionItems: JSON.stringify(aiAnalysis.actionItems),
                            speakers: JSON.stringify(aiAnalysis.speakers),
                            duration: duration,
                            processing: false,
                        },
                    }),
                    // Update meeting status to COMPLETED
                    db.meeting.update({
                        where: { id: meetingId },
                        data: {
                            status: "COMPLETED",
                            updatedAt: new Date(),
                        },
                    }),
                ]);

                // Invalidate relevant caches
                revalidateTag("meetings");
                revalidateTag("meeting");

                console.log(
                    "✅ Meeting transcript processed and saved:",
                    meetingId
                );
                return savedTranscript;
            } catch (error) {
                console.error(
                    "Error processing complete transcription:",
                    error
                );
                throw error;
            }
}

// Optimized AI summary generation using Gemini with better error handling
async function generateAISummary(transcript, meetingTitle) {
    try {
        // Skip AI generation for very short transcripts
        if (!transcript || transcript.trim().length < 50) {
            return {
                summary: `Brief ${meetingTitle} session completed.`,
                        highlights: ["Short meeting session"],
                        actionItems: ["Review meeting notes"],
                        speakers: ["Meeting Participants"],
                        duration: 5,
                    };
                }

                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    generationConfig: {
                        temperature: 0.3, // Lower temperature for more consistent results
                        topK: 40,
                        topP: 0.8,
                        maxOutputTokens: 1024, // Limit response size
                    },
                });

                // Optimized prompt for better JSON responses
                const prompt = `
Analyze this meeting transcript and provide a JSON response:

Meeting: ${meetingTitle}
Transcript: ${transcript.substring(0, 4000)} ${
                    transcript.length > 4000 ? "..." : ""
                }

Respond ONLY with valid JSON:
{
  "summary": "2-3 sentence meeting summary",
  "highlights": ["key point 1", "key point 2", "key point 3"],
  "actionItems": ["action 1", "action 2"],
  "speakers": ["speaker names if identifiable"],
  "duration": ${Math.ceil(transcript.split(" ").length / 150)}
}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean the response to extract JSON
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const jsonText = jsonMatch ? jsonMatch[0] : text;

                try {
                    const parsed = JSON.parse(jsonText);

                    // Validate required fields
                    return {
                        summary:
                            parsed.summary ||
                            `Meeting summary for ${meetingTitle}`,
                        highlights: Array.isArray(parsed.highlights)
                            ? parsed.highlights
                            : ["Meeting completed successfully"],
                        actionItems: Array.isArray(parsed.actionItems)
                            ? parsed.actionItems
                            : ["Review meeting notes"],
                        speakers: Array.isArray(parsed.speakers)
                            ? parsed.speakers
                            : ["Meeting Participants"],
                        duration:
                            typeof parsed.duration === "number"
                                ? parsed.duration
                                : 30,
                    };
                } catch (parseError) {
                    console.warn(
                        "⚠️ Failed to parse AI response, using fallback"
                    );
                    throw parseError;
                }
            } catch (error) {
                console.error("❌ Error generating AI summary:", error);

                // Enhanced fallback summary based on transcript length
                const wordCount = transcript ? transcript.split(" ").length : 0;
                const estimatedDuration = Math.max(
                    5,
                    Math.ceil(wordCount / 150)
                );

                return {
                    summary: `${meetingTitle} completed with ${wordCount} words discussed. AI analysis temporarily unavailable.`,
                    highlights: [
                        "Meeting transcript recorded successfully",
                        `${wordCount} words of discussion captured`,
                        "Participants engaged in productive conversation",
                    ],
                    actionItems: [
                        "Review full transcript for detailed action items",
                        "Follow up on key discussion points",
                    ],
                    speakers: ["Meeting Participants"],
                    duration: estimatedDuration,
                };
            }
}
