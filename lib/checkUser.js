import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export async function checkUser() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const existingUser = await db?.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    await db?.user.create({
      data: {
        clerkUserId: user.id,
        imageUrl: user.imageUrl,
        name,
        email: user.emailAddresses[0].emailAddress,
      },
    });
  } catch (error) {
    console.error(error);
  }
}
