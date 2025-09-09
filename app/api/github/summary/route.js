import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const repo = searchParams.get("repo");

    if (!username || !repo) {
        return new Response(
            JSON.stringify({
                error: "Username and repository name are required",
            }),
            { status: 400 }
        );
    }

    try {
        const today = new Date();
        const todayDate = today.toISOString().split("T")[0];
        const githubUrl = `https://api.github.com/repos/${username}/${repo}/commits?since=${todayDate}T00:00:00Z&until=${todayDate}T23:59:59Z&per_page=5`;
        const response = await axios.get(githubUrl, {
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${process.env.NEXT_GITHUB_TOKEN}`,
            },
        });

        const commits = await Promise.all(
            response.data.slice(0, 4).map(async (commit) => {
                // console.log("commit", commit);
                const commitDetails = await axios.get(commit.url, {
                    headers: {
                        Accept: "application/vnd.github+json",
                        Authorization: `Bearer ${process.env.NEXT_GITHUB_TOKEN}`,
                    },
                });

                const files = commitDetails.data?.files?.map((file) => ({
                    filename: file.filename,
                    status: file.status,
                    changes: file.changes,
                    patch: file.patch
                        ? file.patch.slice(0, 200)
                        : "No patch available", // Limiting patch length
                }));

                return {
                    message: commit.commit.message,
                    author: commit.commit.author.name,
                    date: commit.commit.author.date,
                    url: commit.html_url,
                    files,
                };
            })
        );

        if (commits.length === 0) {
            return new Response(
                JSON.stringify({ report: "No commits today." }),
                {
                    status: 200,
                }
            );
        }

        const prompt = `
      Generate a concise summary report for today's end of the day report, focusing on the commits and file-level changes listed below:

      ${commits
          .map(
              (commit, index) => `
        ### Commit ${index + 1}:
        - Message: ${commit.message}
        - Author: ${commit.author}
        - Date: ${commit.date}
        - URL: ${commit.url}
        - Files:
        ${commit.files
            .map(
                (file) => `
          - File: ${file.filename}
          - Status: ${file.status}
          - Changes: ${file.changes} lines modified
          - Summary of Patch: ${file.patch}
        `
            )
            .join("\n")}
      `
          )
          .join("\n")}
      
      - Please summarize the intent behind each change and its potential impact.
      - Provide any insights on how these modifications affect the overall project, and highlight any potential areas for improvement.
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const report = await result.response.text();

        return new Response(JSON.stringify({ report }), { status: 200 });
    } catch (error) {
        console.error("Error fetching commit data:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch commit data" }),
            { status: 500 }
        );
    }
}
