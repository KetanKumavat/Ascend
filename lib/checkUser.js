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

    const newUser = await db?.user.create({
      data: {
        clerkUserId: user.id,
        imageUrl: user.imageUrl,
        name,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.error("checkUser error:", error.message);
    return null;
  }
}
