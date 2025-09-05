"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getCachedUser, getOrCreateUser } from "@/lib/user-utils";
import { timeQuery } from "@/lib/performance";

export async function getMessagesForProject(projectId) {
  const auth_result = await auth();
  const { userId, orgId } = auth_result;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const messages = await timeQuery(
    'getMessagesForProject',
    () => db.message.findMany({
      where: { projectId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        projectId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "asc" },
    }),
    { projectId }
  );

  return messages;
}

export async function createMessage(projectId, data) {
  const auth_result = await auth();
  const { userId, orgId } = auth_result;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Use cached user lookup
  const user = await getCachedUser(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newMessage = await timeQuery(
    'createMessage',
    () => db.message.create({
      data: {
        content: data.content,
        userId: user.id,
        projectId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        projectId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    { projectId, userId: user.id }
  );

  return newMessage;
}

export async function getUserByClerkId(clerkUserId) {
  try {
    // Use cached user lookup
    return await getCachedUser(clerkUserId);
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
