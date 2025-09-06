import { unstable_cache } from "next/cache";

// Cache organization data for 5 minutes
export const getCachedOrganization = unstable_cache(
    async (slug, userId) => {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const organization = await clerkClient().organizations.getOrganization({
            slug,
        });

        if (!organization) {
            return null;
        }

        // Check if user belongs to this organization
        const { data: membership } =
            await clerkClient().organizations.getOrganizationMembershipList({
                organizationId: organization.id,
            });

        const userMembership = membership.find(
            (member) => member.publicUserData.userId === userId
        );

        // If user is not a member, return null
        if (!userMembership) {
            return null;
        }

        return organization;
    },
    ["organization"],
    {
        revalidate: 300, // 5 minutes
        tags: ["organization"],
    }
);

// Cache projects data for 2 minutes
export const getCachedProjects = unstable_cache(
    async (orgId, userId) => {
        const { db } = await import("@/lib/prisma");
        const { getCachedUser } = await import("@/lib/user-utils");

        const user = await getCachedUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const projects = await db.project.findMany({
            where: {
                organizationId: orgId,
            },
            select: {
                id: true,
                name: true,
                key: true,
                description: true,
                repoName: true,
                organizationId: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        sprints: true,
                        meetings: true,
                        issues: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return projects;
    },
    ["projects"],
    {
        revalidate: 120, // 2 minutes
        tags: ["projects"],
    }
);

// Cache meetings data for 1 minute
export const getCachedMeetings = unstable_cache(
    async (orgId, userId, projectId = null) => {
        const { db } = await import("@/lib/prisma");
        const { getCachedUser } = await import("@/lib/user-utils");

        const user = await getCachedUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const whereClause = {
            organizationId: orgId,
            ...(projectId && { projectId: projectId }),
        };

        const meetings = await db.meeting.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                description: true,
                scheduledAt: true,
                duration: true,
                status: true,
                meetingUrl: true,
                googleEventId: true,
                organizationId: true,
                projectId: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                        key: true,
                    },
                },
                _count: {
                    select: {
                        participants: true,
                    },
                },
                transcript: {
                    select: {
                        id: true,
                        content: true,
                        highlights: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
            orderBy: {
                scheduledAt: "desc",
            },
        });

        return meetings;
    },
    ["meetings"],
    {
        revalidate: 60, // 1 minute
        tags: ["meetings"],
    }
);

// Cache single meeting data for 30 seconds (since it may change frequently during live meetings)
export const getCachedMeeting = unstable_cache(
    async (meetingId, orgId, userId) => {
        const { db } = await import("@/lib/prisma");
        const { getCachedUser } = await import("@/lib/user-utils");

        const user = await getCachedUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // First check if meeting exists at all
        const meetingExists = await db.meeting.findUnique({
            where: { id: meetingId },
            select: { id: true, organizationId: true, isPublic: true },
        });

        if (!meetingExists) {
            throw new Error("Meeting not found");
        }

        // Check if user has access (either same org or public meeting)
        const hasAccess =
            meetingExists.organizationId === orgId || meetingExists.isPublic;
        console.log("User has access:", hasAccess, {
            userOrgId: orgId,
            meetingOrgId: meetingExists.organizationId,
            isPublic: meetingExists.isPublic,
        });

        if (!hasAccess) {
            throw new Error("Access denied");
        }

        const meeting = await db.meeting.findUnique({
            where: { id: meetingId },
            select: {
                id: true,
                title: true,
                description: true,
                scheduledAt: true,
                duration: true,
                status: true,
                meetingUrl: true,
                googleEventId: true,
                organizationId: true,
                projectId: true,
                isPublic: true,
                publicToken: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                        key: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        status: true,
                        joinedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                transcript: {
                    select: {
                        id: true,
                        content: true,
                        highlights: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!meeting) {
            throw new Error("Meeting not found or access denied");
        }

        return meeting;
    },
    ["meeting"],
    {
        revalidate: 30, // 30 seconds
        tags: ["meeting"],
    }
);

// Cache organization users for 10 minutes
export const getCachedOrganizationUsers = unstable_cache(
    async (orgId, userId) => {
        const { db } = await import("@/lib/prisma");
        const { clerkClient } = await import("@clerk/nextjs/server");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const organizationMemberships =
            await clerkClient().organizations.getOrganizationMembershipList({
                organizationId: orgId,
            });

        const userIds = organizationMemberships.data.map(
            (membership) => membership.publicUserData.userId
        );

        const users = await db.user.findMany({
            where: {
                clerkUserId: {
                    in: userIds,
                },
            },
        });

        return users;
    },
    ["organization-users"],
    {
        revalidate: 600, // 10 minutes
        tags: ["organization-users"],
    }
);
