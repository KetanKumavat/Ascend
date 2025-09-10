import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
        const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));

        // Get all projects that have commits from yesterday
        const projectsWithCommits = await db.project.findMany({
            where: {
                commits: {
                    some: {
                        commitDate: {
                            gte: yesterdayStart,
                            lte: yesterdayEnd,
                        },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                organizationId: true,
            },
        });

        const results = [];

        for (const project of projectsWithCommits) {
            try {
                // Check if summary already exists for this date
                const existingSummary = await db.dailySummary.findUnique({
                    where: {
                        projectId_date: {
                            projectId: project.id,
                            date: yesterdayStart,
                        },
                    },
                });

                if (!existingSummary) {
                    // Generate summary by calling the daily-summary API
                    const summaryResponse = await fetch(
                        `${
                            process.env.NEXT_PUBLIC_APP_URL ||
                            "http://localhost:3000"
                        }/api/daily-summary`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${process.env.CRON_SECRET}`,
                            },
                            body: JSON.stringify({
                                projectId: project.id,
                                date: yesterdayStart
                                    .toISOString()
                                    .split("T")[0],
                            }),
                        }
                    );

                    if (summaryResponse.ok) {
                        const summaryData = await summaryResponse.json();

                        if (summaryData.success && summaryData.summary) {
                            // Send email notification
                            const emailResponse = await fetch(
                                `${
                                    process.env.NEXT_PUBLIC_APP_URL ||
                                    "http://localhost:3000"
                                }/api/send-daily-summary`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${process.env.CRON_SECRET}`,
                                    },
                                    body: JSON.stringify({
                                        projectId: project.id,
                                        summaryId: summaryData.summary.id,
                                    }),
                                }
                            );

                            const emailData = emailResponse.ok
                                ? await emailResponse.json()
                                : null;

                            results.push({
                                projectId: project.id,
                                projectName: project.name,
                                status: "success",
                                summaryGenerated: true,
                                emailSent: emailData?.success || false,
                                emailsSent: emailData?.emailsSent || 0,
                            });
                        } else {
                            results.push({
                                projectId: project.id,
                                projectName: project.name,
                                status: "no_commits",
                                summaryGenerated: false,
                                emailSent: false,
                            });
                        }
                    } else {
                        results.push({
                            projectId: project.id,
                            projectName: project.name,
                            status: "error",
                            error: "Failed to generate summary",
                        });
                    }
                } else {
                    results.push({
                        projectId: project.id,
                        projectName: project.name,
                        status: "already_exists",
                        summaryGenerated: false,
                        emailSent: existingSummary.emailSent,
                    });
                }
            } catch (error) {
                console.error(`Error processing project ${project.id}:`, error);
                results.push({
                    projectId: project.id,
                    projectName: project.name,
                    status: "error",
                    error: error.message,
                });
            }
        }

        return NextResponse.json({
            success: true,
            date: yesterdayStart.toISOString().split("T")[0],
            projectsProcessed: projectsWithCommits.length,
            results: results,
        });
    } catch (error) {
        console.error("Error in scheduled daily summary job:", error);
        return NextResponse.json(
            { error: "Failed to run scheduled daily summary job" },
            { status: 500 }
        );
    }
}

// GET endpoint for manual trigger (with auth check)
export async function GET(request) {
    try {
        // For manual testing - you'd typically want proper auth here
        const url = new URL(request.url);
        const secret = url.searchParams.get("secret");

        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Call the POST method
        return POST(request);
    } catch (error) {
        console.error("Error in manual daily summary trigger:", error);
        return NextResponse.json(
            { error: "Failed to trigger daily summary job" },
            { status: 500 }
        );
    }
}
