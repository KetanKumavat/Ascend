import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_GEMINI_API_KEY);

export async function GET(req) {
  // Get the commit SHA from the URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const commitSHA = pathParts[pathParts.length - 1];

  // Get username and repo from searchParams
  const username = url.searchParams.get("username");
  const repo = url.searchParams.get("repo");

  if (!commitSHA || !username || !repo) {
    return new Response(
      JSON.stringify({
        error: "Commit SHA, username, and repository name are required",
      }),
      { status: 400 }
    );
  }

  const githubUrl = `https://api.github.com/repos/${username}/${repo}/commits/${commitSHA}`;

  try {
    // Fetch the commit data from GitHub
    const response = await axios.get(githubUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.NEXT_GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    // Structure the commit data
    const commitData = {
      message: response.data.commit.message,
      author: response.data.commit.author.name,
      date: response.data.commit.author.date,
      url: response.data.html_url,
      stats: {
        totalChanges: response.data.stats.total,
        additions: response.data.stats.additions,
        deletions: response.data.stats.deletions,
      },
      files: response.data.files.map((file) => ({
        authors: file.author,
        filename: file.filename,
        changes: file.changes,
        additions: file.additions,
        deletions: file.deletions,
        patch:
          file.patch && file.patch.length > 500
            ? `${file.patch.slice(0, 500)}...`
            : file.patch,
      })),
    };

    // Create a detailed prompt for the Gemini API
    const prompt = `
      Generate a detailed documentation for the following commit:

      ## Commit Documentation
      **Commit Message**: ${commitData.message}
      **Author**: ${commitData.author}
      **Date**: ${commitData.date}
      **Commit URL**: ${commitData.url}

      ### Stats:
      - **Total Changes**: ${commitData.stats.totalChanges}
      - **Additions**: ${commitData.stats.additions}
      - **Deletions**: ${commitData.stats.deletions}

      ### Key Changes:
      ${commitData.files
        .map(
          (file) =>
            `- **${file.filename}**: Changes: ${file.changes}, Additions: ${file.additions}, Deletions: ${file.deletions}`
        )
        .join("\n")}

      ### Notes:
      - Provide any notes or considerations about the changes made.
      - Analyze the impact of these changes on the codebase.
      - Suggest any potential improvements or areas that might need attention.
    `;

    // Send the prompt to the Gemini API to generate documentation
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // Return the generated document
    return new Response(responseText, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching commit data:", error);
    if (error && typeof error === "object") {
      const err = error;
      const errorMessage =
        err.response?.data?.message || "Failed to fetch commit data";

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: err.response?.status || 500,
      });
    }
    return new Response(
      JSON.stringify({ error: "Failed to fetch commit data" }),
      { status: 500 }
    );
  }
}
