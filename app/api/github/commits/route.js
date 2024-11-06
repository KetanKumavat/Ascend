import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const repo = searchParams.get("repo");

  if (!username || !repo) {
    return NextResponse.json(
      { error: "Username and repository name are required" },
      { status: 400 }
    );
  }

  try {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];
    //since=${todayDate}T00:00:00Z&until=${todayDate}T23:59:59Z&
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repo}/commits?per_page=5`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${process.env.NEXT_GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
