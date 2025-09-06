import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
    try {
        // Verify this is coming from LiveKit (you should add proper webhook verification)
        const signature = request.headers.get('livekit-signature');
        // TODO: Verify webhook signature for security
        
        const data = await request.json();
        
        console.log("LiveKit transcription webhook received:", data);

        if (data.event === 'transcription_complete') {
            await handleTranscriptionComplete(data);
        } else if (data.event === 'transcription_segment') {
            await handleTranscriptionSegment(data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing transcription webhook:", error);
        return NextResponse.json(
            { error: "Failed to process transcription" },
            { status: 500 }
        );
    }
}

async function handleTranscriptionSegment(data) {
    const { room_name, participant_id, text, is_final, language } = data;
    
    // Extract meeting ID from room name (format: ascend-{meetingId}-{timestamp})
    const meetingId = room_name.split('-')[1];
    
    if (!meetingId) {
        console.error("Could not extract meeting ID from room name:", room_name);
        return;
    }

    try {
        // Store real-time transcript segment in database
        await db.transcriptSegment.create({
            data: {
                meetingId,
                participantId: participant_id,
                text,
                isFinal: is_final,
                language: language || 'en',
                timestamp: new Date(),
            },
        });

        console.log("Transcript segment stored for meeting:", meetingId);
    } catch (error) {
        console.error("Error storing transcript segment:", error);
    }
}

async function handleTranscriptionComplete(data) {
    const { room_name, transcript, duration, participants } = data;
    
    // Extract meeting ID from room name
    const meetingId = room_name.split('-')[1];
    
    if (!meetingId) {
        console.error("Could not extract meeting ID from room name:", room_name);
        return;
    }

    try {
        // Get meeting details
        const meeting = await db.meeting.findUnique({
            where: { id: meetingId },
            include: { project: true },
        });

        if (!meeting) {
            console.error("Meeting not found:", meetingId);
            return;
        }

        // Generate AI summary using Gemini
        const aiAnalysis = await generateAISummary(transcript, meeting.title);
        
        // Save complete transcript to database
        const savedTranscript = await db.meetingTranscript.upsert({
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
        });

        // Update meeting status to COMPLETED
        await db.meeting.update({
            where: { id: meetingId },
            data: { status: "COMPLETED" },
        });

        console.log("Meeting transcript processed and saved:", meetingId);
    } catch (error) {
        console.error("Error processing complete transcription:", error);
    }
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
                summary: `Meeting summary for ${meetingTitle}. Discussion covered various topics and decisions.`,
                highlights: [
                    "Meeting successfully transcribed",
                    "Participants engaged in productive discussion",
                    "Key decisions and topics covered"
                ],
                actionItems: [
                    "Review meeting transcript for action items",
                    "Follow up on discussed topics"
                ],
                speakers: ["Meeting Participants"],
                duration: 30
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
            duration: 30
        };
    }
}
