import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { userId } = req.query;

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  return NextResponse.json({ githubUsername: user?.githubUsername });
}
