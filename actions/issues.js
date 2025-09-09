"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getCachedUser, getOrCreateUser } from "@/lib/user-utils";

export async function getIssuesForSprint(sprintId) {
  const auth_result = await auth();
  const { userId, orgId } = auth_result;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const issues = await db.issue.findMany({
    where: { sprintId: sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      order: true,
      projectId: true,
      sprintId: true,
      assigneeId: true,
      reporterId: true,
      createdAt: true,
      updatedAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true
        }
      },
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true
        }
      },
    },
  });

  return issues;
}

export async function createIssue(projectId, data) {
  try {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    // Use cached user lookup
    const user = await getCachedUser(userId);

    // Validate assignee exists if provided
    let validAssigneeId = null;
    if (data.assigneeId) {
      const assigneeExists = await db.user.findUnique({
        where: { id: data.assigneeId },
        select: { id: true }
      });
      if (assigneeExists) {
        validAssigneeId = data.assigneeId;
      }
    }

    // Optimize order calculation with more specific query
    const lastIssue = await db.issue.findFirst({
      where: { 
        projectId, 
        status: data.status 
      },
      select: { order: true },
      orderBy: { order: "desc" },
    });

    const newOrder = lastIssue ? lastIssue.order + 1 : 0;

    const issue = await db.issue.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: projectId,
        sprintId: data.sprintId,
        reporterId: user.id,
        assigneeId: validAssigneeId,
        order: newOrder,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return issue;
  } catch (error) {
    console.error("Error creating issue:", error);
    throw new Error("Failed to create issue. Please try again.");
  }
}

export async function updateIssueOrder(updatedIssues) {
  const auth_result = await auth();
  const { userId, orgId } = auth_result;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  await db.$transaction(async (prisma) => {
    for (const issue of updatedIssues) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
      });
    }
  });

  return { success: true };
}

export async function deleteIssue(issueId) {
  const auth_result = await auth();
  const { userId, orgId } = auth_result;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (
    issue.reporterId !== user.id &&
    !issue.project.adminIds.includes(user.id)
  ) {
    throw new Error("You don't have permission to delete this issue");
  }

  await db.issue.delete({ where: { id: issueId } });

  return { success: true };
}

export async function updateIssue(issueId, data) {
  const auth_result = await auth();
  const { userId, orgId } = auth_result;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: { project: true },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return updatedIssue;
  } catch (error) {
    throw new Error("Error updating issue: " + error.message);
  }
}
