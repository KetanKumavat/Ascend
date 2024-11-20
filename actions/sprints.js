"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(projectId, data) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { sprints: { orderBy: { createdAt: "desc" } } },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found");
  }

  const sprint = await db.sprint.create({
    data: {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "PLANNED",
      projectId: projectId,
    },
  });

  return sprint;
}

export async function updateSprintStatus(sprintId, newStatus) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id: sprintId },
      include: { project: true },
    });

    if (!sprint) {
      return { success: false, message: "Sprint not found" };
    }

    if (sprint.project.organizationId !== orgId) {
      return { success: false, message: "Unauthorized access" };
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
    });

    return { success: true, sprint: updatedSprint };
  } catch (error) {
    return { success: false, message: error.message };
  }
}