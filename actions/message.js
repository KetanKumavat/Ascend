"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getMessagesForProject(projectId) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const messages = await db.message.findMany({
    where: { projectId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}

export async function createMessage(projectId, data) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const newMessage = await db.message.create({
    data: {
      content: data.content,
      userId: user.id,
      projectId,
    },
  });

  return newMessage;
}

export async function getUserByClerkId(clerkUserId) {
  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: clerkUserId,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by Clerk ID:", error);
    throw new Error("Failed to fetch user");
  }
}

// export async function deleteMessage(messageId) {
//   const { userId, orgId } = await auth();

//   if (!userId || !orgId) {
//     throw new Error("Unauthorized");
//   }

//   const message = await db.message.findUnique({
//     where: { id: messageId },
//     include: { user: true },
//   });

//   if (!message) {
//     throw new Error("Message not found");
//   }

//   if (message.userId !== userId) {
//     throw new Error("You don't have permission to delete this message");
//   }

//   await db.message.delete({ where: { id: messageId } });

//   return { success: true };
// }

// export async function updateMessage(messageId, data) {
//   const { userId, orgId } = await auth();

//   if (!userId || !orgId) {
//     throw new Error("Unauthorized");
//   }

//   const message = await db.message.findUnique({
//     where: { id: messageId },
//     include: { user: true },
//   });

//   if (!message) {
//     throw new Error("Message not found");
//   }

//   if (message.userId !== userId) {
//     throw new Error("You don't have permission to update this message");
//   }

//   const updatedMessage = await db.message.update({
//     where: { id: messageId },
//     data: {
//       content: data.content,
//     },
//   });

//   return updatedMessage;
// }
