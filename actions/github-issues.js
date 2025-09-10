"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getGitHubIssues(projectId) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const project = await db.project.findUnique({
            where: { id: projectId },
            select: {
                repoName: true,
                organizationId: true,
            },
        });

        if (!project || !project.repoName) {
            return { issues: [], error: "No GitHub repository configured" };
        }

        const repoMatch = project.repoName.match(
            /github\.com\/([^\/]+)\/([^\/]+)/
        );
        if (!repoMatch) {
            return { issues: [], error: "Invalid GitHub repository URL" };
        }

        const [, owner, repo] = repoMatch;
        const repoName = repo.replace(/\.git$/, ""); // Remove .git if present

        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/issues?state=open&per_page=20`,
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "Ascend-App",
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    issues: [],
                    error: "Repository not found or not accessible",
                };
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const githubIssues = await response.json();

        const issues = githubIssues
            .filter((issue) => !issue.pull_request)
            .map((issue) => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                body: issue.body || "",
                state: issue.state,
                htmlUrl: issue.html_url,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                labels: issue.labels.map((label) => ({
                    name: label.name,
                    color: label.color,
                })),
                assignee: issue.assignee
                    ? {
                          login: issue.assignee.login,
                          avatarUrl: issue.assignee.avatar_url,
                      }
                    : null,
                author: {
                    login: issue.user.login,
                    avatarUrl: issue.user.avatar_url,
                },
            }));

        return { issues, error: null };
    } catch (error) {
        console.error("Error fetching GitHub issues:", error);
        return {
            issues: [],
            error: error.message || "Failed to fetch GitHub issues",
        };
    }
}
