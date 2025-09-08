import { NextResponse } from "next/server";
import { createMeeting, getMeetings } from "@/actions/meetings";

// Add response headers for better caching
const getResponseHeaders = (cacheTime = 60) => ({
    "Cache-Control": `s-maxage=${cacheTime}, stale-while-revalidate`,
    "Content-Type": "application/json",
});

export async function POST(request) {
    const startTime = performance.now();

    try {
        // Validate content type
        const contentType = request.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return NextResponse.json(
                { error: "Content-Type must be application/json" },
                { status: 400 }
            );
        }

        const data = await request.json();

        // Enhanced validation with detailed error messages
        const validationErrors = [];
        if (!data.title?.trim()) validationErrors.push("Title is required");
        if (!data.scheduledAt)
            validationErrors.push("Scheduled time is required");
        if (data.duration && data.duration <= 0)
            validationErrors.push("Duration must be positive");

        if (validationErrors.length > 0) {
            return NextResponse.json(
                { error: "Validation failed", details: validationErrors },
                { status: 400 }
            );
        }

        const meeting = await createMeeting(data);

        const duration = performance.now() - startTime;
        console.log(`Meeting created in ${duration.toFixed(2)}ms`);

        return NextResponse.json(meeting, {
            status: 201,
            headers: getResponseHeaders(0), // Don't cache POST responses
        });
    } catch (error) {
        const duration = performance.now() - startTime;

        // Enhanced error responses
        const statusCode = error.message.includes("Unauthorized")
            ? 401
            : error.message.includes("permission")
            ? 403
            : error.message.includes("Validation")
            ? 400
            : 500;

        return NextResponse.json(
            {
                error: error.message,
                timestamp: new Date().toISOString(),
                ...(process.env.NODE_ENV === "development" && {
                    stack: error.stack,
                }),
            },
            { status: statusCode }
        );
    }
}

export async function GET(request) {
    const startTime = performance.now();

    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 100); // Max 100 items

        const meetings = await getMeetings(projectId, page, limit);

        const duration = performance.now() - startTime;
        console.log(`Meetings fetched in ${duration.toFixed(2)}ms`);

        return NextResponse.json(meetings, {
            headers: getResponseHeaders(60), // Cache for 1 minute
        });
    } catch (error) {
        const duration = performance.now() - startTime;
        console.error(
            `❌ Get meetings failed in ${duration.toFixed(2)}ms:`,
            error
        );

        const statusCode = error.message.includes("Unauthorized") ? 401 : 500;

        return NextResponse.json(
            {
                error: error.message,
                timestamp: new Date().toISOString(),
                ...(process.env.NODE_ENV === "development" && {
                    stack: error.stack,
                }),
            },
            { status: statusCode }
        );
    }
}
