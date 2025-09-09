import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUsernameFromRepoUrl } from "@/lib/getUsername";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(request, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, commitId } = await params;

        // Check if report already exists
        const existingReport = await db.commitReport.findUnique({
            where: { commitId },
            include: {
                commit: {
                    select: {
                        sha: true,
                        message: true,
                        author: true,
                        commitDate: true,
                        htmlUrl: true
                    }
                }
            }
        });

        if (existingReport) {
            return NextResponse.json({
                report: existingReport,
                cached: true
            });
        }

        return NextResponse.json({ error: "Report not found" }, { status: 404 });

    } catch (error) {
        console.error("Error fetching commit report:", error);
        return NextResponse.json(
            { error: "Failed to fetch commit report" },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, commitId } = await params;

        // Check if report already exists
        const existingReport = await db.commitReport.findUnique({
            where: { commitId }
        });

        if (existingReport) {
            return NextResponse.json({
                report: existingReport,
                cached: true
            });
        }

        // Get commit details
        const commit = await db.commit.findUnique({
            where: { id: commitId },
            include: {
                project: {
                    select: {
                        repoName: true
                    }
                }
            }
        });

        if (!commit) {
            return NextResponse.json({ error: "Commit not found" }, { status: 404 });
        }

        const repoUrl = commit.project.repoName;
        if (!repoUrl) {
            return NextResponse.json({ error: "No repository URL configured" }, { status: 400 });
        }

        const username = getUsernameFromRepoUrl(repoUrl);
        const repo = new URL(repoUrl).pathname.split("/")[2];

        // Fetch detailed commit data from GitHub
        const response = await fetch(
            `https://api.github.com/repos/${username}/${repo}/commits/${commit.sha}`,
            {
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${process.env.NEXT_GITHUB_TOKEN}`,
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API responded with status ${response.status}`);
        }

        const commitDetails = await response.json();

        // Update commit with additional details
        await db.commit.update({
            where: { id: commitId },
            data: {
                totalChanges: commitDetails.stats?.total || 0,
                additions: commitDetails.stats?.additions || 0,
                deletions: commitDetails.stats?.deletions || 0,
                filesChanged: commitDetails.files ? commitDetails.files.map(file => ({
                    filename: file.filename,
                    status: file.status,
                    changes: file.changes,
                    additions: file.additions,
                    deletions: file.deletions,
                    patch: file.patch && file.patch.length > 500 
                        ? `${file.patch.slice(0, 500)}...` 
                        : file.patch
                })) : null
            }
        });

        // Generate report using AI
        const prompt = `
Generate a detailed but concise commit analysis report for the following commit:

## Commit Information
**Message**: ${commitDetails.commit.message}
**Author**: ${commitDetails.commit.author.name}
**Date**: ${commitDetails.commit.author.date}
**URL**: ${commitDetails.html_url}

### Statistics:
- **Total Changes**: ${commitDetails.stats?.total || 0}
- **Additions**: ${commitDetails.stats?.additions || 0}
- **Deletions**: ${commitDetails.stats?.deletions || 0}

### Key Files Changed:
${commitDetails.files?.slice(0, 10).map(file => 
    `- **${file.filename}**: ${file.changes} changes (${file.additions} additions, ${file.deletions} deletions)`
).join('\n') || 'No files information available'}

Please provide:
1. A brief summary (2-3 sentences) of what this commit accomplishes
2. The potential impact on the codebase
3. Any notable patterns or areas that might need attention

Keep the response professional and focused on technical aspects.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const reportContent = await result.response.text();

        // Extract summary (first paragraph)
        const lines = reportContent.split('\n').filter(line => line.trim());
        const summary = lines.slice(0, 3).join(' ').substring(0, 500);

        // Store the report
        const newReport = await db.commitReport.create({
            data: {
                commitId,
                content: reportContent,
                summary: summary,
                impact: commitDetails.stats?.total > 100 ? "High" : 
                       commitDetails.stats?.total > 50 ? "Medium" : "Low"
            },
            include: {
                commit: {
                    select: {
                        sha: true,
                        message: true,
                        author: true,
                        commitDate: true,
                        htmlUrl: true
                    }
                }
            }
        });

        return NextResponse.json({
            report: newReport,
            cached: false
        });

    } catch (error) {
        console.error("Error generating commit report:", error);
        return NextResponse.json(
            { error: "Failed to generate commit report" },
            { status: 500 }
        );
    }
}
