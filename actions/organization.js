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
import { 
  getCachedOrganization, 
  getCachedProjects, 
  getCachedOrganizationUsers 
} from "@/lib/cache";
import { getCachedUser } from "@/lib/user-utils";

export async function getOrganization(slug) {
  const auth_result = await auth();
  const { userId } = auth_result;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Use cached user lookup
  const user = await getCachedUser(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Use cached organization data
  return await getCachedOrganization(slug, userId);
}

export async function getProjects(orgId) {
  // console.log("orgId", orgId);
  const auth_result = await auth();
  const { userId } = auth_result;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Use cached projects data
  return await getCachedProjects(orgId, userId);
}

export async function getUserIssues(userId) {
  const { orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("No user id or organization id found");
  }

  // Use cached user lookup
  const user = await getCachedUser(userId);

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
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      projectId: true,
      sprintId: true,
      assigneeId: true,
      reporterId: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          id: true,
          name: true,
          key: true
        }
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      reporter: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

export async function getOrganizationUsers(orgId) {
  const auth_result = await auth();
  const { userId } = auth_result;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Use cached organization users data
  return await getCachedOrganizationUsers(orgId, userId);
}
