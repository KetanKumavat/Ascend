"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getCachedUser } from "@/lib/user-utils";
import { getCachedProjects } from "@/lib/cache";

export async function createProject(data) {
    const auth_result = await auth();
    const { userId, orgId } = auth_result;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    if (!orgId) {
        throw new Error("No Organization Selected");
    }

    const { data: membershipList } =
        await clerkClient().organizations.getOrganizationMembershipList({
            organizationId: orgId,
        });

    const userMembership = membershipList.find(
        (membership) => membership.publicUserData.userId === userId
    );

    if (!userMembership || userMembership.role !== "org:admin") {
        throw new Error("Only organization admins can create projects");
    }

    try {
        const project = await db.project.create({
            data: {
                name: data.name,
                key: data.key,
                description: data.description,
                repoName: data.repoName,
                organizationId: orgId,
            },
        });

        return project;
    } catch (error) {
        throw new Error("Error creating project: " + error.message);
    }
}

export async function getProject(projectId) {
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

    // Get project with sprints and organization - optimized query
    const project = await db.project.findFirst({
        where: {
            id: projectId,
            organizationId: orgId, // Include org check in query
        },
        include: {
            sprints: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    return project;
}

export async function deleteProject(projectId) {
    const auth_result = await auth();
    const { userId, orgId, orgRole } = auth_result;

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    if (orgRole !== "org:admin") {
        throw new Error("Only organization admins can delete projects");
    }

    const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
            sprints: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!project || project.organizationId !== orgId) {
        throw new Error(
            "Project not found or you don't have permission to delete it"
        );
    }

    await db.project.delete({
        where: { id: projectId },
    });

    return { success: true };
}

export async function updateProject(data) {
    const auth_result = await auth();
    const { userId, orgId, orgRole } = auth_result;
    console.log("data", data);

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    if (orgRole !== "org:admin") {
        throw new Error("Only organization admins can update projects");
    }

    const project = await db.project.findUnique({
        where: { id: data.id },
    });

    if (!project || project.organizationId !== orgId) {
        throw new Error(
            "Project not found or you don't have permission to update it"
        );
    }

    const updatedProject = await db.project.update({
        where: { id: data.id },
        data: {
            name: data.name,
            key: data.key,
            description: data.description,
            repoName: data.repoName,
        },
    });

    return updatedProject;
}

export async function getProjects(orgId) {
    const auth_result = await auth();
    const { userId } = auth_result;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Use cached projects data
    return await getCachedProjects(orgId, userId);
}
