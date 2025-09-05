"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getCachedUser } from "@/lib/user-utils";

export async function createSprint(projectId, data) {
  const auth_result = await auth();
  const { userId, orgId } = auth_result;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Optimize project lookup with org check in query
  const project = await db.project.findFirst({
    where: { 
      id: projectId,
      organizationId: orgId // Include org check in query
    },
    select: {
      id: true,
      name: true,
      organizationId: true,
      _count: {
        select: {
          sprints: true
        }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  const sprint = await db.sprint.create({
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "PLANNED",
      projectId: projectId,
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      status: true,
      projectId: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return sprint;
}

export async function updateSprintStatus(sprintId, newStatus) {
  const auth_result = await auth();
  const { userId, orgId, orgRole } = auth_result;

  if (!userId || !orgId) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Optimize sprint lookup with project and org check in query
    const sprint = await db.sprint.findFirst({
      where: { 
        id: sprintId,
        project: {
          organizationId: orgId
        }
      },
      select: {
        id: true,
        status: true,
        projectId: true,
        project: {
          select: {
            id: true,
            organizationId: true
          }
        }
      }
    });

    if (!sprint) {
      return { success: false, message: "Sprint not found or access denied" };
    }

    if (orgRole !== "org:admin") {
      return { success: false, message: "Only Admin can make this change" };
    }

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
      return {
        success: false,
        message: "Cannot start sprint outside of its date range",
      };
    }

    if (newStatus === "COMPLETED" && sprint.status !== "ACTIVE") {
      return { success: false, message: "Can only complete an active sprint" };
    }

    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        projectId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return { success: true, sprint: updatedSprint };
  } catch (error) {
    return { success: false, message: error.message };
  }
}