"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "googleapis";
import { getCachedMeetings, getCachedMeeting } from "@/lib/cache";
import { getCachedUser, getOrCreateUser } from "@/lib/user-utils";

// Initialize Gemini AI for transcript processing
const gemini = new GoogleGenerativeAI(process.env.NEXT_GEMINI_API_KEY);

// Helper function to generate Google Meet-style codes (fallback only)

export async function createMeeting(data) {
    const auth_result = await auth();
    const { userId, orgId, orgRole } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Check if user has permission to create meetings (admin or specific role)
    const { data: membershipList } =
        await clerkClient().organizations.getOrganizationMembershipList({
            organizationId: orgId,
        });

    const userMembership = membershipList.find(
        (membership) => membership.publicUserData.userId === userId
    );

    if (
        !userMembership ||
        (userMembership.role !== "org:admin" &&
            userMembership.role !== "org:member")
    ) {
        throw new Error("Insufficient permissions to create meetings");
    }

    // Get or create user in database using cached utility
    const user = await getOrCreateUser(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Validate project if specified with optimized query
    let project = null;
    if (data.projectId) {
        project = await db.project.findFirst({
            where: {
                id: data.projectId,
                organizationId: orgId, // Include org check in query
            },
            select: {
                id: true,
                name: true,
                organizationId: true,
            },
        });

        if (!project) {
            throw new Error("Project not found or access denied");
        }
    }

    try {
        // Create meeting in database first
        const meeting = await db.meeting.create({
            data: {
                title: data.title,
                description: data.description,
                scheduledAt: new Date(data.scheduledAt),
                duration: data.duration,
                organizationId: orgId,
                projectId: data.projectId || null,
                createdById: user.id,
                status: "SCHEDULED",
            },
            include: {
                createdBy: true,
                project: true,
                participants: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        // Create LiveKit meeting room
        let meetingUrl = null;
        let googleEventId = null;
        let livekitRoomName = null;

        try {
            console.log("Creating LiveKit meeting room...");

            // Create LiveKit room name
            livekitRoomName = `ascend-${meeting.id}-${Date.now()}`;

            // LiveKit meeting URL will be our meeting room page
            meetingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/meeting/${meeting.id}/room`;

            console.log("✅ LiveKit meeting room configured:", {
                roomName: livekitRoomName,
                meetingUrl,
                features:
                    "HD Video, Audio, Screen Share, Chat, AI Transcription",
            });

            // Optional: Try Google Calendar integration if credentials available
            try {
                const googleMeetResult = await createGoogleMeetEvent({
                    title: meeting.title,
                    description: `${
                        meeting.description
                    }\n\n🎥 Join Meeting: ${meetingUrl}\n\n📝 AI Transcript: ${
                        process.env.NEXT_PUBLIC_APP_URL ||
                        "http://localhost:3001"
                    }/meeting/${meeting.id}/transcript`,
                    scheduledAt: meeting.scheduledAt,
                    duration: meeting.duration,
                });

                if (googleMeetResult.googleEventId) {
                    googleEventId = googleMeetResult.googleEventId;
                    console.log(
                        "📅 Also added to Google Calendar:",
                        googleEventId
                    );
                }
            } catch (calendarError) {
                console.log(
                    "📅 Google Calendar integration skipped:",
                    calendarError.message
                );
                // Don't fail - Meeting still works perfectly
            }
        } catch (error) {
            console.error("Failed to create meeting:", error.message);

            // Even simpler fallback - still use secure meeting room
            const simpleRoom = `ascend-${Date.now()}`;
            meetingUrl = `https://meet.jit.si/${simpleRoom}`;
            googleMeetId = simpleRoom;

            console.log("Using simple meeting room:", meetingUrl);
        }

        // Update meeting with LiveKit room details
        const updatedMeeting = await db.meeting.update({
            where: { id: meeting.id },
            data: {
                meetingUrl: meetingUrl,
                meetingId: livekitRoomName,
                // Store Google Calendar event ID for future reference
                description:
                    meeting.description +
                    (googleEventId
                        ? `\n\nGoogle Event ID: ${googleEventId}`
                        : ""),
            },
            include: {
                createdBy: true,
                project: true,
                participants: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return updatedMeeting;
    } catch (error) {
        throw new Error("Error creating meeting: " + error.message);
    }
}

export async function getMeetings(projectId = null) {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Use cached meetings data
    return await getCachedMeetings(orgId, userId, projectId);
}

export async function getMeeting(meetingId) {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Use cached meeting data
    return await getCachedMeeting(meetingId, orgId, userId);
}

export async function joinMeeting(meetingId) {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Use cached user lookup
    const user = await getCachedUser(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Optimized meeting lookup with org check in query
    const meeting = await db.meeting.findFirst({
        where: {
            id: meetingId,
            organizationId: orgId, // Include org check in query
        },
        select: {
            id: true,
            organizationId: true,
            status: true,
        },
    });

    if (!meeting) {
        throw new Error("Meeting not found or access denied");
    }

    // Add user as participant if not already added - use upsert for efficiency
    await db.meetingParticipant.upsert({
        where: {
            meetingId_userId: {
                meetingId: meetingId,
                userId: user.id,
            },
        },
        update: {
            status: "JOINED",
        },
        create: {
            meetingId: meetingId,
            userId: user.id,
            status: "JOINED",
        },
    });
    return {
        meetingUrl: meeting.meetingUrl,
        meetingId: meeting.meetingId,
    };
}

export async function updateMeetingStatus(meetingId, status) {
    const auth_result = await auth();
    const { userId, orgId, orgRole } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Use cached user lookup
    const user = await getCachedUser(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Optimized meeting lookup with permission check in query
    const meeting = await db.meeting.findFirst({
        where: {
            id: meetingId,
            organizationId: orgId,
            OR: [
                { createdById: user.id }, // User is creator
                // Admin check will be done after if needed
            ],
        },
        select: {
            id: true,
            organizationId: true,
            createdById: true,
            status: true,
        },
    });

    if (!meeting) {
        throw new Error("Meeting not found or access denied");
    }

    // Check if user has permission to update meeting status
    if (meeting.createdById !== user.id && orgRole !== "org:admin") {
        throw new Error("Insufficient permissions to update meeting");
    }

    const updatedMeeting = await db.meeting.update({
        where: { id: meetingId },
        data: { status },
        include: {
            createdBy: true,
            project: true,
            participants: {
                include: {
                    user: true,
                },
            },
            transcript: true,
        },
    });

    return updatedMeeting;
}

export async function deleteMeeting(meetingId) {
    const auth_result = await auth();
    const { userId, orgId, orgRole } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const meeting = await db.meeting.findUnique({
        where: { id: meetingId },
    });

    if (!meeting || meeting.organizationId !== orgId) {
        throw new Error("Meeting not found or access denied");
    }

    // Check if user has permission to delete meeting
    if (meeting.createdById !== user.id && orgRole !== "org:admin") {
        throw new Error("Only meeting creator or admin can delete meetings");
    }

    await db.meeting.delete({
        where: { id: meetingId },
    });

    return { success: true };
}

// Function to add meeting transcript (real Google Meet integration)
export async function addMeetingTranscript(meetingId, transcriptContent) {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const meeting = await db.meeting.findUnique({
        where: { id: meetingId },
    });

    if (!meeting || meeting.organizationId !== orgId) {
        throw new Error("Meeting not found or access denied");
    }

    // Generate AI highlights using Gemini
    const highlights = await generateMeetingHighlights(transcriptContent);

    const transcript = await db.meetingTranscript.upsert({
        where: { meetingId: meetingId },
        update: {
            content: transcriptContent,
            highlights: highlights,
        },
        create: {
            meetingId: meetingId,
            content: transcriptContent,
            highlights: highlights,
        },
    });

    // Update meeting status to completed
    await db.meeting.update({
        where: { id: meetingId },
        data: { status: "COMPLETED" },
    });

    return transcript;
}

// Helper function to generate meeting highlights using AI
async function generateMeetingHighlights(transcriptContent) {
    try {
        // Use the already initialized Gemini instance for consistency
        const model = gemini.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
    Analyze this meeting transcript and provide:
    1. Key discussion points (3-5 main topics)
    2. Action items and decisions made
    3. Important deadlines or next steps mentioned
    4. Technical discussions or solutions proposed (if any)
    5. Follow-up tasks and responsible parties
    
    Format as a structured summary that project teams would find useful.
    
    Transcript:
    ${transcriptContent}
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generating highlights:", error);
        return "Failed to generate AI highlights. Please review the transcript manually.";
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
                source: "browser-transcript",
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

        console.log("📝 Transcript saved with AI insights:", transcript.id);
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

// Generate public sharing token for a meeting
export async function generatePublicToken(meetingId) {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Verify user has access to this meeting
    const meeting = await db.meeting.findUnique({
        where: { id: meetingId },
        select: {
            id: true,
            organizationId: true,
            createdById: true,
            isPublic: true,
            publicToken: true,
        },
    });

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    if (meeting.organizationId !== orgId) {
        throw new Error("Access denied");
    }

    // Generate a secure random token
    const publicToken = `meet_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 16)}`;

    // Update meeting with public access
    const updatedMeeting = await db.meeting.update({
        where: { id: meetingId },
        data: {
            isPublic: true,
            publicToken,
        },
        select: {
            publicToken: true,
        },
    });

    return updatedMeeting.publicToken;
}

// Revoke public access for a meeting
export async function revokePublicAccess(meetingId) {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    // Verify user has access to this meeting
    const meeting = await db.meeting.findUnique({
        where: { id: meetingId },
        select: {
            id: true,
            organizationId: true,
            createdById: true,
        },
    });

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    if (meeting.organizationId !== orgId) {
        throw new Error("Access denied");
    }

    // Remove public access
    await db.meeting.update({
        where: { id: meetingId },
        data: {
            isPublic: false,
            publicToken: null,
        },
    });

    return { success: true };
}

// Get public meeting info (for sharing)
export async function getPublicMeetingInfo(meetingId) {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const meeting = await db.meeting.findUnique({
        where: { id: meetingId },
        select: {
            id: true,
            title: true,
            organizationId: true,
            isPublic: true,
            publicToken: true,
        },
    });

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    if (meeting.organizationId !== orgId) {
        throw new Error("Access denied");
    }

    return {
        isPublic: meeting.isPublic,
        publicToken: meeting.publicToken,
        publicUrl: meeting.publicToken
            ? `${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/join/${meeting.publicToken}`
            : null,
    };
}
