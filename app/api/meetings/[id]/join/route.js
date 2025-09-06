import { NextResponse } from "next/server";
import { joinMeeting } from "@/actions/meetings";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const result = await joinMeeting(resolvedParams.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Join meeting error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
