import { unstable_cache } from "next/cache";
import { db } from "@/lib/prisma";

const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    clerkUserId: true,
    githubUsername: true,
    createdAt: true,
    imageUrl: true,
};

async function invalidateUserCacheTags() {
    const cache = await import("next/cache");
    await Promise.all([
        cache.revalidateTag("user"),
        cache.revalidateTag("users"),
    ]);
}

async function getClerkUserData(clerkUserId) {
    try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkUserId);

        const primaryEmail =
            clerkUser.emailAddresses.find(
                (email) => email.id === clerkUser.primaryEmailAddressId,
            )?.emailAddress ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            null;

        const fullName = [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

        return {
            email: primaryEmail,
            name: fullName || clerkUser.username || null,
            imageUrl: clerkUser.imageUrl || null,
        };
    } catch (error) {
        console.error("Failed to fetch user data from Clerk", error);
        return {};
    }
}

export const getCachedUser = unstable_cache(
    async (clerkUserId) => {
        const user = await db.user.findUnique({
            where: { clerkUserId },
            select: USER_SELECT,
        });
        return user;
    },
    ["user"],
    {
        revalidate: 300, // 5 minutes
        tags: ["user"],
    },
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
            select: USER_SELECT,
        });
        return users;
    },
    ["users"],
    {
        revalidate: 300, // 5 minutes
        tags: ["users"],
    },
);

// Create user if not exists with caching
export async function getOrCreateUser(clerkUserId, userData = {}) {
    if (!clerkUserId) {
        return null;
    }

    let user = await getCachedUser(clerkUserId);

    if (user) {
        return user;
    }

    const clerkUserData = await getClerkUserData(clerkUserId);
    const resolvedEmail = (userData.email || clerkUserData.email || "")
        .trim()
        .toLowerCase();
    const resolvedName = userData.name || clerkUserData.name || null;
    const resolvedImageUrl =
        userData.imageUrl || clerkUserData.imageUrl || null;
    const resolvedGithubUsername =
        userData.githubUsername !== undefined ? userData.githubUsername : null;

    if (!resolvedEmail) {
        throw new Error("Cannot create user without an email address");
    }

    const existingByEmail = await db.user.findUnique({
        where: { email: resolvedEmail },
        select: USER_SELECT,
    });

    if (existingByEmail) {
        if (existingByEmail.clerkUserId === clerkUserId) {
            return existingByEmail;
        }

        const updateData = {
            clerkUserId,
            ...(resolvedName ? { name: resolvedName } : {}),
            ...(resolvedImageUrl ? { imageUrl: resolvedImageUrl } : {}),
            ...(userData.githubUsername !== undefined
                ? { githubUsername: resolvedGithubUsername }
                : {}),
        };

        user = await db.user.update({
            where: { id: existingByEmail.id },
            data: updateData,
            select: USER_SELECT,
        });

        await invalidateUserCacheTags();
        return user;
    }

    try {
        user = await db.user.create({
            data: {
                imageUrl: resolvedImageUrl,
                clerkUserId,
                name: resolvedName,
                email: resolvedEmail,
                githubUsername: resolvedGithubUsername,
            },
            select: USER_SELECT,
        });
    } catch (error) {
        // Handle concurrent create attempts by falling back to the winning row.
        if (error?.code === "P2002") {
            user = await db.user.findFirst({
                where: {
                    OR: [{ clerkUserId }, { email: resolvedEmail }],
                },
                select: USER_SELECT,
            });
        } else {
            throw error;
        }
    }

    if (!user) {
        throw new Error("Failed to create or resolve user");
    }

    await invalidateUserCacheTags();

    return user;
}
