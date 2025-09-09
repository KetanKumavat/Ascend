import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getUsernameFromRepoUrl } from "@/lib/getUsername";
import { content } from "googleapis/build/src/apis/content";

export async function GET(request, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { projectId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const refresh = searchParams.get("refresh") === "true";

        // Get project details
        const project = await db.project.findUnique({
            where: { id: projectId },
            select: { id: true, repoName: true, organizationId: true },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        if (!project.repoName) {
            return NextResponse.json(
                { error: "No repository URL configured" },
                { status: 400 }
            );
        }

        const username = getUsernameFromRepoUrl(project.repoName);
        const repo = new URL(project.repoName).pathname.split("/")[2];

        if (!username || !repo) {
            return NextResponse.json(
                { error: "Invalid repository URL" },
                { status: 400 }
            );
        }

        // If refresh is requested, fetch from GitHub and update database
        if (refresh) {
            await fetchAndStoreCommits(projectId, username, repo);
        }

        // Get commits from database with pagination
        const commits = await db.commit.findMany({
            where: { projectId },
            include: {
                report: {
                    select: {
                        id: true,
                        summary: true,
                        generatedAt: true,
                        content: true,
                    },
                },
            },
            orderBy: { commitDate: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        });

        const totalCommits = await db.commit.count({
            where: { projectId },
        });

        return NextResponse.json({
            commits,
            pagination: {
                page,
                limit,
                total: totalCommits,
                totalPages: Math.ceil(totalCommits / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching commits:", error);
        return NextResponse.json(
            { error: "Failed to fetch commits" },
            { status: 500 }
        );
    }
}

async function fetchAndStoreCommits(projectId, username, repo) {
    try {
        // Fetch last 30 days of commits
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const response = await fetch(
            `https://api.github.com/repos/${username}/${repo}/commits?since=${thirtyDaysAgo.toISOString()}&per_page=50`,
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    Authorization: `token ${process.env.NEXT_GITHUB_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                `GitHub API responded with status ${response.status}`
            );
        }

        const githubCommits = await response.json();

        for (const githubCommit of githubCommits) {
            await db.commit.upsert({
                where: { sha: githubCommit.sha },
                update: {
                    message: githubCommit.commit.message,
                    author: githubCommit.commit.author.name,
                    authorEmail: githubCommit.commit.author.email,
                    commitDate: new Date(githubCommit.commit.author.date),
                    htmlUrl: githubCommit.html_url,
                    fetchedAt: new Date(),
                },
                create: {
                    sha: githubCommit.sha,
                    message: githubCommit.commit.message,
                    author: githubCommit.commit.author.name,
                    authorEmail: githubCommit.commit.author.email,
                    commitDate: new Date(githubCommit.commit.author.date),
                    htmlUrl: githubCommit.html_url,
                    projectId,
                    fetchedAt: new Date(),
                },
            });
        }
    } catch (error) {
        console.error("Error fetching commits from GitHub:", error);
        throw error;
    }
}
