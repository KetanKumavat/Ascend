import { unstable_cache } from "next/cache";

const USER_SELECT = {
    id: true,
    clerkUserId: true,
    email: true,
    name: true,
    imageUrl: true,
    createdAt: true,
};

const PROJECT_SELECT = {
    id: true,
    name: true,
    key: true,
    description: true,
    createdAt: true,
    organizationId: true,
};

const MEETING_SELECT = {
    id: true,
    title: true,
    description: true,
    scheduledStartTime: true,
    scheduledEndTime: true,
    status: true,
    meetingUrl: true,
    meetingId: true,
    createdAt: true,
    updatedAt: true,
};

// Enhanced cache organization data with better error handling
export const getCachedOrganization = unstable_cache(
    async (slug, userId) => {
        const { clerkClient } = await import("@clerk/nextjs/server");

        // Batch both operations for better performance
        const [organization, membership] = await Promise.allSettled([
            clerkClient().organizations.getOrganization({ slug }),
            clerkClient().organizations.getOrganizationMembershipList({
                organizationId: slug,
            }),
        ]);

        // Handle organization result
        if (organization.status === "rejected" || !organization.value) {
            return null;
        }

        // Handle membership result with fallback
        const membershipData =
            membership.status === "fulfilled"
                ? membership.value.data
                : [];

        const userMembership = membershipData?.find(
            (member) => member.publicUserData.userId === userId
        );

        // If user is not a member, return null
        if (!userMembership) {
            return null;
        }

        return organization.value;
    },
    ["organization"],
    {
        revalidate: 300, // 5 minutes
        tags: ["organization"],
    }
);

// Enhanced cache projects with optimized queries
export const getCachedProjects = unstable_cache(
    async (orgId, userId) => {
        const { db } = await import("@/lib/prisma");
        const { getCachedUser } = await import("@/lib/user-utils");

        const user = await getCachedUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Optimized query with specific selects for better performance
        const projects = await db.project.findMany({
            where: {
                organizationId: orgId,
            },
            select: {
                ...PROJECT_SELECT,
                repoName: true,
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
                updatedAt: "desc", // Changed to updatedAt for more relevant sorting
            },
            take: 50, // Limit to 50 projects for better performance
        });

        return projects;
    },
    ["projects"],
    {
        revalidate: 120, // 2 minutes
        tags: ["projects"],
    }
);

// Enhanced cache meetings with optimized queries and pagination
export const getCachedMeetings = unstable_cache(
    async (orgId, userId, projectId = null, page = 1, limit = 20) => {
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

        // Add pagination for better performance
        const offset = (page - 1) * limit;

        // Batch count and data queries for efficiency
        const [meetings, totalCount] = await Promise.all([
            db.meeting.findMany({
                where: whereClause,
                select: {
                    ...MEETING_SELECT,
                    scheduledStartTime: true,
                    scheduledEndTime: true,
                    projectId: true,
                    createdBy: {
                        select: USER_SELECT,
                    },
                    project: {
                        select: PROJECT_SELECT,
                    },
                    _count: {
                        select: {
                            participants: true,
                        },
                    },
                    // Only load transcript summary for performance
                    transcript: {
                        select: {
                            id: true,
                            createdAt: true,
                            updatedAt: true,
                            // Don't load full content in list view
                        },
                    },
                },
                orderBy: {
                    scheduledStartTime: "desc",
                },
                take: limit,
                skip: offset,
            }),
            // Get total count for pagination
            db.meeting.count({
                where: whereClause,
            }),
        ]);

        return {
            meetings,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: totalCount > offset + limit,
            hasPrevPage: page > 1,
        };
    },
    ["meetings"],
    {
        revalidate: 60, // 1 minute
        tags: ["meetings"],
    }
);

// Enhanced cache single meeting with better access control and performance
export const getCachedMeeting = unstable_cache(
    async (meetingId, orgId, userId) => {
        const { db } = await import("@/lib/prisma");
        const { getCachedUser } = await import("@/lib/user-utils");

        const user = await getCachedUser(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Optimized single query with access control included
        const meeting = await db.meeting.findFirst({
            where: {
                id: meetingId,
                OR: [
                    { organizationId: orgId }, // User's organization
                    { isPublic: true }, // Public meeting
                ],
            },
            select: {
                ...MEETING_SELECT,
                scheduledStartTime: true,
                scheduledEndTime: true,
                projectId: true,
                isPublic: true,
                publicToken: true,
                createdBy: {
                    select: USER_SELECT,
                },
                project: {
                    select: PROJECT_SELECT,
                },
                participants: {
                    select: {
                        id: true,
                        status: true,
                        joinedAt: true,
                        user: {
                            select: USER_SELECT,
                        },
                    },
                    orderBy: {
                        joinedAt: "desc",
                    },
                    take: 50, // Limit participants for performance
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
