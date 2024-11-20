// using clerk BAPI

// "use server";

// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// async function clerkBackendAPI(endpoint) {
//   try {
//     console.log(`Making request to: ${endpoint}`);
//     const response = await fetch(`https://api.clerk.com/v1${endpoint}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("Response status:", response.status);

//     const data = await response.json();
//     console.log("Response data:", data);

//     if (!response.ok) {
//       throw new Error(data.errors?.[0]?.message || "API request failed");
//     }

//     return data;
//   } catch (error) {
//     console.error("Clerk API Error:", error);
//     throw new Error(`Clerk API Error: ${error.message}`);
//   }
// }

// export async function getOrganizationInfo(orgSlug) {
//   try {
//     // Get auth session
//     const { userId } = await auth();
//     console.log("User ID:", userId);

//     if (!userId) {
//       throw new Error("Unauthorized");
//     }

//     // Verify user exists in your database
//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user) {
//       throw new Error("User not found in database");
//     }

//     // First, get the user's organizations to find the correct organization ID
//     const userOrgs = await clerkBackendAPI(
//       `/users/${userId}/organization_memberships`
//     );
//     console.log("User organizations (membership data):", userOrgs);

//     // Find the organization with matching slug
//     const orgMembership = userOrgs.data.find(
//       (org) => org.organization?.slug === orgSlug
//     );

//     if (!orgMembership) {
//       throw new Error("Organization not found");
//     }

//     const organizationId = orgMembership.organization.id;
//     console.log("Found organization ID:", organizationId);

//     // Get detailed organization information using the actual organization ID
//     const organization = await clerkBackendAPI(
//       `/organizations/${organizationId}`
//     );

//     if (!organization) {
//       throw new Error("Organization not found");
//     }

//     // Get memberships for the organization using the organization ID
//     console.log("Fetching memberships for organization:", organizationId);
//     const membershipsResponse = await clerkBackendAPI(
//       `/organizations/${organizationId}/memberships`
//     );
//     const memberships = membershipsResponse.data || [];

//     // Verify user's membership
//     const userMembership = memberships.find(
//       (membership) => membership.public_user_data?.user_id === userId
//     );

//     if (!userMembership) {
//       throw new Error("User is not a member of this organization");
//     }

//     // Return formatted organization data
//     return {
//       id: organization.id,
//       name: organization.name,
//       slug: organization.slug,
//       imageUrl: organization.image_url,
//       logoUrl: organization.logo_url,
//       createdAt: organization.created_at,
//       updatedAt: organization.updated_at,
//       membership: userMembership,
//       memberships: memberships,
//       metadata: {
//         private: organization.private_metadata,
//         public: organization.public_metadata,
//       },
//     };
//   } catch (error) {
//     console.error("Error in getOrganizationInfo:", error);
//     throw error;
//   }
// }

"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the organization details
  const organization = await clerkClient().organizations.getOrganization({
    slug,
  });

  if (!organization) {
    return null;
  }

  // Check if user belongs to this organization
  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  // If user is not a member, return null
  if (!userMembership) {
    return null;
  }

  return organization;
}

export async function getProjects(orgId) {
  // console.log("orgId", orgId);
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  // console.log("projects", projects);
  return projects;
}

export async function getUserIssues(userId) {
  const { orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("No user id or organization id found");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issues = await db.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: {
        organizationId: orgId,
      },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

export async function getOrganizationUsers(orgId) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const organizationMemberships =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

  const userIds = organizationMemberships.data.map(
    (membership) => membership.publicUserData.userId
  );

  const users = await db.user.findMany({
    where: {
      clerkUserId: {
        in: userIds,
      },
    },
  });

  return users;
}
