import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req) {
  const { githubUsername, userId } = await req.json();

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      githubUsername: githubUsername,
    },
  });

  return NextResponse.json({ success: true });
}