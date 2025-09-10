import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
    sendDailySummaryEmail,
    sendIssueAssignmentEmail,
} from "@/lib/email-utils";

export async function POST(request) {
    try {
        const authHeader = request.headers.get("authorization");
        const isCronJob =
            authHeader && authHeader === `Bearer ${process.env.CRON_SECRET}`;

        let userId;
        if (!isCronJob) {
            const authResult = await auth();
            userId = authResult.userId;
            if (!userId) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        }

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: "Resend API key not configured" },
                { status: 500 }
            );
        }

        const { type, data } = await request.json();

        if (!type || !data) {
            return NextResponse.json(
                { error: "Email type and data are required" },
                { status: 400 }
            );
        }

        let emailResult;

        switch (type) {
            case "DAILY_SUMMARY":
                emailResult = await sendDailySummaryEmail(data);
                break;
            case "ISSUE_ASSIGNMENT":
                emailResult = await sendIssueAssignmentEmail(data);
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid email type" },
                    { status: 400 }
                );
        }

        return NextResponse.json(emailResult);
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: "Failed to send email", details: error.message },
            { status: 500 }
        );
    }
}
