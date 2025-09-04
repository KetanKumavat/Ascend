"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { GoogleAuth } from "google-auth-library";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "googleapis";

// Initialize Google Auth
const googleAuth = new GoogleAuth({
    scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
    ],
    credentials: {
        client_email: process.env.NEXT_GOOGLE_CLIENT_EMAIL,
        private_key: process.env.NEXT_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});

// Initialize Gemini AI for transcript processing
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to create actual Google Meet meeting using Calendar API
async function createGoogleMeetEvent(meetingData) {
    try {
        const authClient = await googleAuth.getClient();
        const calendar = google.calendar({ version: "v3", auth: authClient });

        const startDateTime = new Date(meetingData.scheduledAt);
        const endDateTime = new Date(
            startDateTime.getTime() + meetingData.duration * 60 * 1000
        );

        const event = {
            summary: meetingData.title,
            description: meetingData.description || "",
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: "UTC",
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: "UTC",
            },
            conferenceData: {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: "hangoutsMeet",
                    },
                },
            },
            attendees: [], // Will be populated later with participants
        };

        console.log("Creating Google Calendar event with Meet link...");

        let response;
        let calendarId;

        // Strategy 1: Try primary calendar (works with domain-wide delegation)
        try {
            console.log("Attempting to create event in primary calendar...");
            response = await calendar.events.insert({
                calendarId: "primary",
                resource: event,
                conferenceDataVersion: 1,
            });
            calendarId = "primary";
            console.log("✅ Event created in primary calendar");
        } catch (primaryError) {
            console.log("❌ Primary calendar failed:", primaryError.message);
            
            // Strategy 2: Try service account's own calendar
            try {
                console.log("Attempting to create event in service account calendar...");
                const serviceAccountEmail = process.env.NEXT_GOOGLE_CLIENT_EMAIL;
                response = await calendar.events.insert({
                    calendarId: serviceAccountEmail,
                    resource: event,
                    conferenceDataVersion: 1,
                });
                calendarId = serviceAccountEmail;
                console.log("✅ Event created in service account calendar");
            } catch (serviceError) {
                console.log("❌ Service account calendar failed:", serviceError.message);
                
                // If both fail, throw the original error with helpful context
                throw new Error(`Google Calendar API access failed. ${primaryError.message}. This usually means domain-wide delegation is not enabled or the service account lacks permissions.`);
            }
        }

        console.log("Google Calendar event created:", response.data.id);

        if (
            response.data.conferenceData &&
            response.data.conferenceData.entryPoints
        ) {
            const meetLink = response.data.conferenceData.entryPoints.find(
                (entry) => entry.entryPointType === "video"
            );

            return {
                meetingUrl: meetLink ? meetLink.uri : null,
                googleEventId: response.data.id,
                conferenceData: response.data.conferenceData,
            };
        }

        throw new Error("Failed to create Google Meet link");
    } catch (error) {
        console.error("Error creating Google Meet event:", error);
        throw new Error(`Failed to create Google Meet: ${error.message}`);
    }
}

// Helper function to generate Google Meet-style codes (fallback only)
function generateMeetCode() {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const segments = [];

    // Generate 3 segments like Google Meet: xxx-yyyy-zzz
    // First segment: 3 letters
    let segment1 = "";
    for (let j = 0; j < 3; j++) {
        segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment1);

    // Second segment: 4 letters
    let segment2 = "";
    for (let j = 0; j < 4; j++) {
        segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment2);

    // Third segment: 3 letters
    let segment3 = "";
    for (let j = 0; j < 3; j++) {
        segment3 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment3);

    return segments.join("-");
}

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

    // Find user in database
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Validate project if specified
    if (data.projectId) {
        const project = await db.project.findUnique({
            where: { id: data.projectId },
        });

        if (!project || project.organizationId !== orgId) {
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

        // Create meeting with REAL Google Meet integration
        let meetingUrl = null;
        let googleEventId = null;
        let googleMeetId = null;

        try {
            console.log("Creating FREE Jitsi Meet room...");

            // Create Jitsi Meet room (completely free, no API key needed)
            const roomName = `ascend-${meeting.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            meetingUrl = `https://meet.jit.si/${roomName}`;
            googleMeetId = roomName; // Use roomName as meeting ID
            
            console.log("✅ FREE Jitsi Meet created:", {
                meetingUrl,
                roomName,
                features: "Video, Audio, Screen Share, Chat, Recording, Live Transcription (all FREE)"
            });

            // Optional: Try Google Calendar integration if credentials available
            try {
                const googleMeetResult = await createGoogleMeetEvent({
                    title: meeting.title,
                    description: `${meeting.description}\n\n🎥 Join Jitsi Meeting: ${meetingUrl}\n\n📝 Live Transcript: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/meeting/${meeting.id}/transcript`,
                    scheduledAt: meeting.scheduledAt,
                    duration: meeting.duration,
                });
                
                if (googleMeetResult.googleEventId) {
                    googleEventId = googleMeetResult.googleEventId;
                    console.log("📅 Also added to Google Calendar:", googleEventId);
                }
            } catch (calendarError) {
                console.log("📅 Google Calendar integration skipped:", calendarError.message);
                // Don't fail - Jitsi Meet still works perfectly
            }

        } catch (error) {
            console.error("Failed to create Jitsi meeting:", error.message);
            
            // Even simpler fallback - still use Jitsi
            const simpleRoom = `ascend-${Date.now()}`;
            meetingUrl = `https://meet.jit.si/${simpleRoom}`;
            googleMeetId = simpleRoom;
            
            console.log("Using simple Jitsi room:", meetingUrl);
        }

        // Update meeting with Google Meet details
        const updatedMeeting = await db.meeting.update({
            where: { id: meeting.id },
            data: {
                meetingUrl: meetingUrl,
                meetingId: googleMeetId,
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

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const whereClause = {
        organizationId: orgId,
        ...(projectId && { projectId: projectId }),
    };

    const meetings = await db.meeting.findMany({
        where: whereClause,
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
        orderBy: {
            scheduledAt: "desc",
        },
    });

    return meetings;
}

export async function getMeeting(meetingId) {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

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

    if (!meeting) {
        throw new Error("Meeting not found");
    }

    // Verify meeting belongs to the organization
    if (meeting.organizationId !== orgId) {
        throw new Error("Access denied");
    }

    return meeting;
}

export async function joinMeeting(meetingId) {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

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

    // Add user as participant if not already added
    const existingParticipant = await db.meetingParticipant.findUnique({
        where: {
            meetingId_userId: {
                meetingId: meetingId,
                userId: user.id,
            },
        },
    });

    if (!existingParticipant) {
        await db.meetingParticipant.create({
            data: {
                meetingId: meetingId,
                userId: user.id,
                joinedAt: new Date(),
            },
        });
    } else if (!existingParticipant.joinedAt) {
        await db.meetingParticipant.update({
            where: {
                meetingId_userId: {
                    meetingId: meetingId,
                    userId: user.id,
                },
            },
            data: {
                joinedAt: new Date(),
            },
        });
    }

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
