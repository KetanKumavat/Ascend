import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { sendDailySummaryEmail } from "@/lib/email-utils";

export async function POST(request) {
    try {
        const authHeader = request.headers.get("authorization");
        const isCronJob =
            authHeader && authHeader === `Bearer ${process.env.CRON_SECRET}`;

        let userId, orgId;
        if (!isCronJob) {
            const authResult = await auth();
            userId = authResult.userId;
            orgId = authResult.orgId;
            if (!userId) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        }

        const { projectId, summaryId } = await request.json();

        if (!projectId || !summaryId) {
            return NextResponse.json(
                {
                    error: "Project ID and Summary ID are required",
                },
                { status: 400 }
            );
        }

        // Get the daily summary
        const summary = await db.dailySummary.findUnique({
            where: { id: summaryId },
            include: {
                project: true,
            },
        });

        if (!summary) {
            return NextResponse.json(
                { error: "Summary not found" },
                { status: 404 }
            );
        }

        // Get organization members
        let organizationMembers = [];
        try {
            // For cron jobs, get orgId from the project
            const targetOrgId = orgId || summary.project.organizationId;

            if (targetOrgId) {
                const memberships =
                    await clerkClient.organizations.getOrganizationMembershipList(
                        {
                            organizationId: targetOrgId,
                        }
                    );

                const userIds = memberships.data.map(
                    (membership) => membership.publicUserData.userId
                );
                const users = await clerkClient.users.getUserList({
                    userId: userIds,
                });

                organizationMembers = users.data
                    .filter(
                        (user) =>
                            user.emailAddresses &&
                            user.emailAddresses.length > 0
                    )
                    .map((user) => ({
                        email: user.emailAddresses[0].emailAddress,
                        name:
                            user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username || "Team Member",
                    }));
            }
        } catch (error) {
            console.error("Error fetching organization members:", error);
            // Fallback to current user if not a cron job
            if (!isCronJob && userId) {
                const currentUser = await clerkClient.users.getUser(userId);
                if (
                    currentUser.emailAddresses &&
                    currentUser.emailAddresses.length > 0
                ) {
                    organizationMembers = [
                        {
                            email: currentUser.emailAddresses[0].emailAddress,
                            name:
                                currentUser.firstName && currentUser.lastName
                                    ? `${currentUser.firstName} ${currentUser.lastName}`
                                    : currentUser.username || "User",
                        },
                    ];
                }
            }
        }

        if (organizationMembers.length === 0) {
            return NextResponse.json(
                {
                    error: "No email addresses found for organization members",
                },
                { status: 400 }
            );
        }

        // Use centralized email API to send daily summary
        const emailResult = await sendDailySummaryEmail({
            summary,
            organizationMembers
        });

        // Update the summary to mark as sent
        await db.dailySummary.update({
            where: { id: summaryId },
            data: {
                emailSent: true,
                emailSentAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            emailsSent: emailResult.emailsSent,
            emailsFailed: emailResult.emailsFailed,
            recipients: emailResult.recipients,
            message: emailResult.message,
        });
    } catch (error) {
        console.error("Error sending daily summary email:", error);
        return NextResponse.json(
            { error: "Failed to send daily summary email" },
            { status: 500 }
        );
    }
}

// GET endpoint to check email status
export async function GET(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const summaryId = url.searchParams.get("summaryId");

        if (!summaryId) {
            return NextResponse.json(
                { error: "Summary ID required" },
                { status: 400 }
            );
        }

        const summary = await db.dailySummary.findUnique({
            where: { id: summaryId },
            select: {
                emailSent: true,
                emailSentAt: true,
            },
        });

        if (!summary) {
            return NextResponse.json(
                { error: "Summary not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            emailSent: summary.emailSent,
            emailSentAt: summary.emailSentAt,
        });
    } catch (error) {
        console.error("Error checking email status:", error);
        return NextResponse.json(
            { error: "Failed to check email status" },
            { status: 500 }
        );
    }
}
