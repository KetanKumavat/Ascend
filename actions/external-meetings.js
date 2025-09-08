"use server";

import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidateTag } from "next/cache";

let geminiInstance = null;
function getGeminiInstance() {
    if (!geminiInstance && process.env.GEMINI_API_KEY) {
        geminiInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return geminiInstance;
}

export async function saveExternalMeetingTranscript(meetingData) {
    try {
        const meeting = await db.meeting.upsert({
            where: {
                meetingId: meetingData.externalMeetingCode,
                    },
                    create: {
                        title:
                            meetingData.title ||
                            `External Meeting - ${meetingData.externalMeetingCode}`,
                        description: `External meeting: ${meetingData.externalMeetingCode}`,
                        meetingId: meetingData.externalMeetingCode,
                        meetingUrl: meetingData.originalUrl,
                        scheduledAt: new Date(), // Use consistent field names
                        duration: meetingData.duration || 60,
                        status: "COMPLETED",
                        organizationId: meetingData.organizationId,
                        createdById: meetingData.userId,
                        projectId: meetingData.projectId || null,
                        isExternal: true,
                        externalPlatform: "google-meet",
                    },
                    update: {
                        title:
                            meetingData.title ||
                            `External Meeting - ${meetingData.externalMeetingCode}`,
                        meetingUrl: meetingData.originalUrl,
                        updatedAt: new Date(),
                    },
                    select: {
                        id: true,
                        title: true,
                        organizationId: true,
                    },
                });

                if (meetingData.transcript) {
                    const insights = await generateSimpleInsights(
                        meetingData.transcript
                    );

                    await db.meetingTranscript.upsert({
                        where: { meetingId: meeting.id },
                        create: {
                            meetingId: meeting.id,
                            content: meetingData.transcript,
                            highlights: insights,
                            source: "external-import",
                        },
                        update: {
                            content: meetingData.transcript,
                            highlights: insights,
                            updatedAt: new Date(),
                        },
                    });
                }

                revalidateTag("meetings");
                revalidateTag("meeting");

                return meeting;
            } catch (error) {
                console.error("Error saving external meeting:", error);
                throw new Error(
                    "Failed to save external meeting: " + error.message
                );
            }
}

async function generateSimpleInsights(transcriptContent) {
    try {
        const gemini = getGeminiInstance();
        if (!gemini) {
            return generateFallbackInsights(transcriptContent);
        }

        const model = gemini.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Provide a brief summary and 3 key points from this meeting transcript:

${transcriptContent.substring(0, 2000)}...`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        return {
            summary: response.text().substring(0, 500), // Limit response size
            keyPoints: ["AI-generated insights available"],
            generatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("AI insight generation failed:", error);
        return generateFallbackInsights(transcriptContent);
    }
}

function generateFallbackInsights(transcriptContent) {
    const wordCount = transcriptContent.split(" ").length;
    const estimatedDuration = Math.ceil(wordCount / 150); // ~150 words per minute

    return {
        summary: `External meeting transcript imported (${wordCount} words, ~${estimatedDuration} minutes)`,
        keyPoints: [
            "Full transcript available for review",
            `Estimated duration: ${estimatedDuration} minutes`,
            "External meeting import completed",
        ],
        generatedAt: new Date().toISOString(),
    };
}

// async function generateTranscriptInsights(transcriptContent) {
//     try {
//         const model = gemini.getGenerativeModel({ model: "gemini-pro" });

//         const prompt = `
//         Analyze this meeting transcript and provide:
//         1. A concise summary (2-3 sentences)
//         2. Key discussion points (bullet points)
//         3. Action items and decisions made
//         4. Important deadlines or follow-ups mentioned

//         Transcript:
//         ${transcriptContent}

//         Please format your response as JSON with these fields:
//         {
//             "summary": "...",
//             "keyPoints": ["...", "..."],
//             "actionItems": ["...", "..."],
//             "followUps": ["...", "..."]
//         }
//         `;

//         const result = await model.generateContent(prompt);
//         const response = await result.response;
//         const text = response.text();

//         const insights = JSON.parse(text);

//         return {
//             summary: insights.summary,
//             keyPoints: insights.keyPoints,
//             actionItems: insights.actionItems,
//             followUps: insights.followUps || [],
//             generatedAt: new Date().toISOString(),
//         };
//     } catch (error) {
//         console.error("AI insight generation failed:", error);

//         return {
//             summary: "Meeting transcript captured from external Google Meet.",
//             keyPoints: ["Full transcript available"],
//             actionItems: ["Review meeting recording for details"],
//             followUps: [],
//             generatedAt: new Date().toISOString(),
//         };
//     }
// }
