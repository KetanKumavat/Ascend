import { unstable_cache } from "next/cache";
import { db } from "@/lib/prisma";

export const getCachedUser = unstable_cache(
    async (clerkUserId) => {
        const user = await db.user.findUnique({
            where: { clerkUserId },
            select: {
                id: true,
                name: true,
                email: true,
                clerkUserId: true,
                githubUsername: true,
                createdAt: true,
                imageUrl: true,
            },
        });
        return user;
    },
    ["user"],
    {
        revalidate: 300, // 5 minutes
        tags: ["user"],
    }
);

// Batch user lookup to avoid N+1 queries
export const getCachedUsers = unstable_cache(
    async (clerkUserIds) => {
        const users = await db.user.findMany({
            where: {
                clerkUserId: {
                    in: clerkUserIds,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                clerkUserId: true,
                githubUsername: true,
                createdAt: true,
                imageUrl: true,
            },
        });
        return users;
    },
    ["users"],
    {
        revalidate: 300, // 5 minutes
        tags: ["users"],
    }
);

// Create user if not exists with caching
export async function getOrCreateUser(clerkUserId, userData = {}) {
    let user = await getCachedUser(clerkUserId);

    if (!user && clerkUserId) {
        // User doesn't exist, create it
        user = await db.user.create({
            data: {
                imageUrl: userData.imageUrl || "",
                clerkUserId,
                name: userData.name || "",
                email: userData.email || "",
                githubUsername: userData.githubUsername || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                clerkUserId: true,
                githubUsername: true,
                createdAt: true,
                imageUrl: true,
            },
        });

        // Clear cache to include new user
        await import("next/cache").then((cache) => cache.revalidateTag("user"));
    }

    return user;
}
