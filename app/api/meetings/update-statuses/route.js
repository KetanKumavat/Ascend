import { updateExpiredMeetingStatuses } from "@/actions/meetings";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const updatedCount = await updateExpiredMeetingStatuses();
        
        return NextResponse.json({
            success: true,
            message: `Updated ${updatedCount} meetings to COMPLETED status`,
            updatedCount,
        });
    } catch (error) {
        console.error("Error updating meeting statuses via API:", error);
        
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update meeting statuses",
                message: error.message,
            },
            { status: 500 }
        );
    }
}

// Allow GET requests too for easier testing
export async function GET() {
    return POST();
}
