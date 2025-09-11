"use server";

import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI for transcript processing
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function createLiveKitRoom(meetingData) {
    try {
        // Generate unique LiveKit room name
        const roomName = `ascend-${meetingData.id || Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}`;

        // Meeting URL points to our LiveKit room page
        const meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meeting/${meetingData.id}/room`;

        // console.log("LiveKit meeting room configured:", {
        //     roomName,
        //     meetingUrl,
        //     features: "HD Video, Audio, Screen Share, Chat, AI Transcription",
        // });

        return {
            meetingUrl,
            roomName,
            platform: "livekit",
            features: {
                videoCall: true,
                screenShare: true,
                recording: true,
                chat: true,
                transcription: true,
                participants: "unlimited",
                timeLimit: "none",
                cost: "Enterprise-grade",
            },
        };
    } catch (error) {
        console.error("LiveKit room configuration failed:", error);
        throw error;
    }
}

export async function saveTranscript(meetingId, transcriptData) {
    try {
        // Generate AI insights using Gemini first
        const aiInsights = await generateTranscriptInsights(
            transcriptData.content
        );

        // Create highlights summary from AI insights
        const highlights = JSON.stringify({
            summary: aiInsights.summary,
            keyPoints: aiInsights.keyPoints,
            actionItems: aiInsights.actionItems,
            followUps: aiInsights.followUps,
            speakers: transcriptData.speakers || [],
            metadata: {
                startTime: transcriptData.startTime,
                endTime: transcriptData.endTime,
                language: transcriptData.language || "en",
                source: "livekit-agent",
            },
            generatedAt: new Date().toISOString(),
        });

        // Save transcript (create or update since it's unique per meeting)
        const transcript = await db.meetingTranscript.upsert({
            where: { meetingId: parseInt(meetingId) },
            create: {
                meetingId: parseInt(meetingId),
                content: transcriptData.content,
                highlights: highlights,
            },
            update: {
                content: transcriptData.content,
                highlights: highlights,
            },
        });

        return transcript;
    } catch (error) {
        console.error("Failed to save transcript:", error);
        throw error;
    }
}

async function generateTranscriptInsights(transcriptContent) {
    try {
        const model = gemini.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Analyze this meeting transcript and provide:
        1. A concise summary (2-3 sentences)
        2. Key discussion points (bullet points)
        3. Action items and decisions made
        4. Important deadlines or follow-ups mentioned

        Transcript:
        ${transcriptContent}

        Please format your response as JSON with these fields:
        {
            "summary": "...",
            "keyPoints": ["...", "..."],
            "actionItems": ["...", "..."],
            "followUps": ["...", "..."]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const insights = JSON.parse(text);

        return {
            summary: insights.summary,
            keyPoints: insights.keyPoints,
            actionItems: insights.actionItems,
            followUps: insights.followUps || [],
            generatedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error("AI insight generation failed:", error);

        // Fallback - basic insights
        return {
            summary:
                "Meeting transcript available. AI analysis temporarily unavailable.",
            keyPoints: ["Full transcript saved"],
            actionItems: ["Review meeting recording for details"],
            followUps: [],
            generatedAt: new Date().toISOString(),
        };
    }
}

export async function getLiveKitMeetingWithTranscript(meetingId) {
    try {
        const meeting = await db.meeting.findUnique({
            where: { id: meetingId },
            include: {
                transcript: true,
                participants: {
                    include: { user: true },
                },
                createdBy: true,
                project: true,
            },
        });

        return meeting;
    } catch (error) {
        console.error("Failed to fetch meeting with transcript:", error);
        throw error;
    }
}
