import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "./prisma";

export async function checkUser() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return null;
        }

        const existingUser = await db?.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });

        if (existingUser) {
            return existingUser;
        }

        // Get full user data from Clerk
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        const name = `${user.firstName} ${user.lastName}`;
        const email = user.emailAddresses[0].emailAddress;

        // Use upsert to handle race conditions
        const newUser = await db?.user.upsert({
            where: {
                clerkUserId: userId,
            },
            update: {
                imageUrl: user.imageUrl,
                name,
                email,
            },
            create: {
                clerkUserId: user.id,
                imageUrl: user.imageUrl,
                name,
                email,
            },
        });

        return newUser;
    } catch (error) {
        console.error("checkUser error:", error.message);
        return null;
    }
}
