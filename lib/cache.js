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

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const projects = await db.project.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: "desc" },
        });

        return projects;
    },
    ["projects"],
    {
        revalidate: 300, // 5 minutes
        tags: ["projects"],
    }
);

// Cache meetings data for 1 minute
export const getCachedMeetings = unstable_cache(
    async (orgId, userId, projectId = null) => {
        const { db } = await import("@/lib/prisma");

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
