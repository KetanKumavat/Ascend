import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

        const { projectId, date } = await request.json();

        const summaryDate = date || new Date().toISOString().split("T")[0];
        const startDate = new Date(summaryDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const commits = await prisma.commit.findMany({
            where: {
                projectId: projectId,
                commitDate: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                report: true,
            },
            orderBy: {
                commitDate: "desc",
            },
        });

        if (commits.length === 0) {
            return NextResponse.json({
                message: "No commits found for the specified date",
                summary: null,
            });
        }

        // Generate summary using Google AI
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const commitsData = commits.map((commit) => ({
            message: commit.message,
            author: commit.author,
            time: commit.commitDate,
            changes: `+${commit.additions || 0} -${commit.deletions || 0}`,
            report: commit.report?.summary || "No detailed analysis available",
        }));

        const prompt = `
Generate a comprehensive daily summary report for the following commits made on ${summaryDate}:

${commitsData
    .map(
        (commit, index) => `
${index + 1}. **${commit.message.split("\n")[0]}**
   - Author: ${commit.author}
   - Time: ${new Date(commit.time).toLocaleTimeString()}
   - Changes: ${commit.changes}
   - Analysis: ${commit.report}
`
    )
    .join("\n")}

Please provide:
1. **Executive Summary** - Brief overview of the day's development activity
2. **Key Achievements** - Major features, fixes, or improvements made
3. **Code Quality Metrics** - Overview of code changes and impact
4. **Team Activity** - Contribution summary by different authors
5. **Next Steps** - Recommendations based on the commits

Format the response in clean markdown for email presentation.
`;

        const result = await model.generateContent(prompt);
        const summaryContent = result.response.text();

        // Save the daily summary to database
        const dailySummary = await prisma.dailySummary.create({
            data: {
                projectId: projectId,
                date: startDate,
                content: summaryContent,
                commitsCount: commits.length,
                totalAdditions: commits.reduce(
                    (sum, c) => sum + (c.additions || 0),
                    0
                ),
                totalDeletions: commits.reduce(
                    (sum, c) => sum + (c.deletions || 0),
                    0
                ),
            },
        });

        return NextResponse.json({
            success: true,
            summary: dailySummary,
            commitsAnalyzed: commits.length,
        });
    } catch (error) {
        console.error("Error generating daily summary:", error);
        return NextResponse.json(
            { error: "Failed to generate daily summary" },
            { status: 500 }
        );
    }
}

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
        const projectId = url.searchParams.get("projectId");
        const date = url.searchParams.get("date");

        if (!projectId) {
            return NextResponse.json(
                { error: "Project ID required" },
                { status: 400 }
            );
        }

        let whereClause = { projectId: projectId };

        if (date) {
            const summaryDate = new Date(date);
            whereClause.date = summaryDate;
        }

        const summaries = await prisma.dailySummary.findMany({
            where: whereClause,
            orderBy: {
                date: "desc",
            },
            take: 30, // Last 30 days
        });

        return NextResponse.json({ summaries });
    } catch (error) {
        console.error("Error fetching daily summaries:", error);
        return NextResponse.json(
            { error: "Failed to fetch daily summaries" },
            { status: 500 }
        );
    }
}
