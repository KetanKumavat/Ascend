import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_GEMINI_API_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const repo = searchParams.get("repo");

  if (!username || !repo) {
    return new Response(
      JSON.stringify({ error: "Username and repository name are required" }),
      { status: 400 }
    );
  }

  try {
    const githubUrl = `https://api.github.com/repos/${username}/${repo}/commits?per_page=4`;
    const response = await axios.get(githubUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.NEXT_GITHUB_TOKEN}`,
      },
    });

    const commits = response.data.slice(0, 4).map((commit) => ({
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url,
    }));

    const prompt = `
      Generate a short yet detailed summary report for my end of the day report for the following commits(avoid using tables) :
      ${commits
        .map(
          (commit, index) => `
        ### Commit ${index + 1}:
        - Message: ${commit.message}
        - Author: ${commit.author}
        - Date: ${commit.date}
        - URL: ${commit.url}
      `
        )
        .join("\n")}
      
      - Provide any notes or considerations about the changes made over the time in these commits.
      - Analyze the impact of these changes on the codebase.
      - Suggest any potential improvements or areas that might need attention..
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
