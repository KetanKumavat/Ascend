// Enhanced Meeting Solution - FREE for any meeting platform
"use server";

import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = new GoogleGenerativeAI(process.env.NEXT_GEMINI_API_KEY);

export async function saveExternalMeetingTranscript(meetingData) {
    try {
        // Create or update meeting record for external meeting
        const meeting = await db.meeting.upsert({
            where: { 
                meetingId: meetingData.externalMeetingCode 
            },
            create: {
                title: meetingData.title || `External Meeting - ${meetingData.externalMeetingCode}`,
                description: `External meeting joined via code: ${meetingData.externalMeetingCode}`,
                meetingId: meetingData.externalMeetingCode,
                meetingUrl: meetingData.originalUrl,
                scheduledAt: new Date(),
                duration: meetingData.duration || 60,
                status: "COMPLETED",
                organizationId: meetingData.organizationId,
                createdById: meetingData.userId,
                projectId: meetingData.projectId || null
            },
            update: {
                title: meetingData.title || `External Meeting - ${meetingData.externalMeetingCode}`,
                description: `External meeting joined via code: ${meetingData.externalMeetingCode}`,
                status: "COMPLETED"
            }
        });

        // Generate AI insights
        const aiInsights = await generateTranscriptInsights(meetingData.transcriptContent);
        
        // Save transcript with AI insights
        const transcript = await db.meetingTranscript.upsert({
            where: { meetingId: meeting.id },
            create: {
                meetingId: meeting.id,
                content: meetingData.transcriptContent,
                highlights: JSON.stringify({
                    summary: aiInsights.summary,
                    keyPoints: aiInsights.keyPoints,
                    actionItems: aiInsights.actionItems,
                    followUps: aiInsights.followUps,
                    metadata: {
                        source: 'external-google-meet',
                        captureMethod: 'browser-speech-recognition',
                        externalMeetingCode: meetingData.externalMeetingCode,
                        originalUrl: meetingData.originalUrl,
                        capturedAt: new Date().toISOString()
                    }
                })
            },
            update: {
                content: meetingData.transcriptContent,
                highlights: JSON.stringify({
                    summary: aiInsights.summary,
                    keyPoints: aiInsights.keyPoints,
                    actionItems: aiInsights.actionItems,
                    followUps: aiInsights.followUps,
                    metadata: {
                        source: 'external-google-meet',
                        captureMethod: 'browser-speech-recognition',
                        externalMeetingCode: meetingData.externalMeetingCode,
                        originalUrl: meetingData.originalUrl,
                        updatedAt: new Date().toISOString()
                    }
                })
            }
        });

        console.log("📝 External meeting transcript saved:", transcript.id);
        return { meeting, transcript };

    } catch (error) {
        console.error('Failed to save external meeting transcript:', error);
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
        
        const insights = JSON.parse(text);
        
        return {
            summary: insights.summary,
            keyPoints: insights.keyPoints,
            actionItems: insights.actionItems,
            followUps: insights.followUps || [],
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('AI insight generation failed:', error);
        
        return {
            summary: "Meeting transcript captured from external Google Meet.",
            keyPoints: ["Full transcript available"],
            actionItems: ["Review meeting recording for details"],
            followUps: [],
            generatedAt: new Date().toISOString()
        };
    }
}
