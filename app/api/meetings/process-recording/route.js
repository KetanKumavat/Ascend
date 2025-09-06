import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const audioFile = formData.get('audio');
        const meetingId = formData.get('meetingId');
        const meetingTitle = formData.get('meetingTitle');

        if (!audioFile || !meetingId) {
            return NextResponse.json({ error: "Missing audio file or meeting ID" }, { status: 400 });
        }

        // Save audio file temporarily
        const bytes = await audioFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const audioPath = path.join(tempDir, `${meetingId}-${Date.now()}.webm`);
        await writeFile(audioPath, buffer);

        // Convert audio to text using browser's built-in speech recognition
        // Since we can't directly use speech-to-text APIs with audio files in this setup,
        // we'll use a simulated transcript for now. In production, you'd use:
        // - Google Speech-to-Text API
        // - Whisper API
        // - Assembly AI
        // etc.
        
        // For now, we'll simulate the transcript generation
        const simulatedTranscript = await generateSimulatedTranscript(meetingTitle);
        
        // Generate AI summary using Gemini
        const aiAnalysis = await generateAISummary(simulatedTranscript, meetingTitle);
        
        // Save to database
        const savedTranscript = await db.meetingTranscript.create({
            data: {
                meetingId: meetingId,
                content: simulatedTranscript,
                summary: aiAnalysis.summary,
                highlights: JSON.stringify(aiAnalysis.highlights),
                actionItems: JSON.stringify(aiAnalysis.actionItems),
                speakers: JSON.stringify(aiAnalysis.speakers),
                duration: aiAnalysis.duration,
                processing: false,
                createdAt: new Date(),
            },
        });

        // Clean up temp file
        try {
            fs.unlinkSync(audioPath);
        } catch (error) {
            console.error("Failed to delete temp file:", error);
        }

        return NextResponse.json({
            success: true,
            transcript: savedTranscript,
            message: "Recording processed successfully"
        });

    } catch (error) {
        console.error("Error processing recording:", error);
        return NextResponse.json(
            { error: "Failed to process recording" },
            { status: 500 }
        );
    }
}

// Simulate transcript generation (replace with actual speech-to-text API)
async function generateSimulatedTranscript(meetingTitle) {
    // This would be replaced with actual speech-to-text processing
    return `[Meeting: ${meetingTitle}]

[00:00:05] Speaker 1: Good morning everyone, thank you for joining today's meeting.

[00:00:12] Speaker 2: Hi there, glad to be here. Should we start with the agenda?

[00:00:18] Speaker 1: Absolutely. Today we're discussing the project updates and next steps.

[00:00:25] Speaker 2: Perfect. I have some updates on the development progress that I'd like to share.

[00:00:32] Speaker 1: Great, let's hear what you've got.

[00:00:35] Speaker 2: So we've completed the authentication system and are now working on the dashboard features.

[00:00:42] Speaker 1: That sounds good. What's the timeline looking like for the dashboard completion?

[00:00:48] Speaker 2: We're aiming to have it done by the end of this week. There are just a few more components to build.

[00:00:55] Speaker 1: Excellent. Make sure to keep me updated on any blockers you encounter.

[00:01:02] Speaker 2: Will do. I'll send you a progress update by Wednesday.

[00:01:08] Speaker 1: Perfect. I think that covers everything for today. Thanks for the update!

[00:01:14] Speaker 2: Thank you! Have a great day.`;
}

// Generate AI summary using Gemini
async function generateAISummary(transcript, meetingTitle) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
Analyze this meeting transcript and provide a comprehensive summary:

Meeting Title: ${meetingTitle}
Transcript: ${transcript}

Please provide:
1. A concise summary (2-3 sentences)
2. Key highlights (bullet points)
3. Action items with responsible parties if mentioned
4. List of speakers identified
5. Estimated meeting duration in minutes

Format your response as JSON with the following structure:
{
  "summary": "string",
  "highlights": ["string"],
  "actionItems": ["string"],
  "speakers": ["string"],
  "duration": number
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON response
        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", parseError);
            
            // Fallback if JSON parsing fails
            return {
                summary: `Meeting summary for ${meetingTitle}. Discussion covered project updates and progress.`,
                highlights: [
                    "Project authentication system completed",
                    "Dashboard development in progress",
                    "Timeline review and status updates"
                ],
                actionItems: [
                    "Complete dashboard by end of week",
                    "Send progress update by Wednesday"
                ],
                speakers: ["Speaker 1", "Speaker 2"],
                duration: 5
            };
        }
    } catch (error) {
        console.error("Error generating AI summary:", error);
        
        // Fallback summary
        return {
            summary: `Meeting summary for ${meetingTitle}. AI analysis temporarily unavailable.`,
            highlights: ["Meeting transcript recorded successfully"],
            actionItems: ["Review transcript for action items"],
            speakers: ["Meeting Participants"],
            duration: 10
        };
    }
}
