import { NextResponse } from "next/server";
import { performance } from "perf_hooks";

const rateLimitStore = new Map();

// Enhanced error handling with consistent response format
export function handleApiError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const isProduction = process.env.NODE_ENV === "production";

    // Determine error type and appropriate status code
    let statusCode = 500;
    let errorType = "INTERNAL_ERROR";

    if (
        error.message.includes("Unauthorized") ||
        error.message.includes("User not found")
    ) {
        statusCode = 401;
        errorType = "UNAUTHORIZED";
    } else if (
        error.message.includes("permission") ||
        error.message.includes("access denied")
    ) {
        statusCode = 403;
        errorType = "FORBIDDEN";
    } else if (error.message.includes("not found")) {
        statusCode = 404;
        errorType = "NOT_FOUND";
    } else if (
        error.message.includes("validation") ||
        error.message.includes("required")
    ) {
        statusCode = 400;
        errorType = "VALIDATION_ERROR";
    } else if (error.message.includes("rate limit")) {
        statusCode = 429;
        errorType = "RATE_LIMITED";
    }

    const errorResponse = {
        error: error.message,
        type: errorType,
        timestamp,
        ...context,
        ...(isProduction
            ? {}
            : {
                  stack: error.stack,
                  context: context,
              }),
    };

    // Log error with context
    console.error(`❌ API Error [${errorType}]:`, {
        message: error.message,
        statusCode,
        context,
        ...(isProduction ? {} : { stack: error.stack }),
    });

    return NextResponse.json(errorResponse, { status: statusCode });
}

// Rate limiting middleware
export function rateLimit(options = {}) {
    const {
        windowMs = 60000, // 1 minute
        maxRequests = 100,
        keyGenerator = (request) => {
            // Use IP or user ID for rate limiting
            return (
                request.headers.get("x-forwarded-for") ||
                request.headers.get("x-real-ip") ||
                "anonymous"
            );
        },
    } = options;

    return (request) => {
        const key = keyGenerator(request);
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or create rate limit data for this key
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, []);
        }

        const requests = rateLimitStore.get(key);

        // Remove old requests outside the window
        const validRequests = requests.filter(
            (timestamp) => timestamp > windowStart
        );

        // Check if rate limit exceeded
        if (validRequests.length >= maxRequests) {
            throw new Error(
                `Rate limit exceeded: ${maxRequests} requests per ${
                    windowMs / 1000
                } seconds`
            );
        }

        // Add current request
        validRequests.push(now);
        rateLimitStore.set(key, validRequests);

        // Cleanup old entries periodically
        if (Math.random() < 0.01) {
            // 1% chance
            for (const [k, v] of rateLimitStore.entries()) {
                const validEntries = v.filter(
                    (timestamp) => timestamp > windowStart
                );
                if (validEntries.length === 0) {
                    rateLimitStore.delete(k);
                } else {
                    rateLimitStore.set(k, validEntries);
                }
            }
        }

        return {
            remaining: maxRequests - validRequests.length,
            resetTime: new Date(now + windowMs),
        };
    };
}

// Performance monitoring wrapper for API routes
export function withPerformanceMonitoring(handler, routeName) {
    return async (request, context) => {
        const startTime = performance.now();
        const startMemory = process.memoryUsage();
        const method = request.method;
        const url = new URL(request.url);

        try {
            // Add performance headers
            const response = await handler(request, context);

            const endTime = performance.now();
            const endMemory = process.memoryUsage();
            const duration = endTime - startTime;

            // Add performance headers to response
            if (response instanceof NextResponse) {
                response.headers.set(
                    "X-Response-Time",
                    `${duration.toFixed(2)}ms`
                );
                response.headers.set(
                    "X-Memory-Usage",
                    `${
                        (endMemory.heapUsed - startMemory.heapUsed) /
                        1024 /
                        1024
                    }MB`
                );
            }

            // Log performance metrics
            const logLevel =
                duration > 1000 ? "warn" : duration > 500 ? "info" : "debug";
            console[logLevel](
                `🚀 ${method} ${url.pathname} - ${duration.toFixed(2)}ms`,
                {
                    route: routeName,
                    duration: `${duration.toFixed(2)}ms`,
                    memory: `${(
                        (endMemory.heapUsed - startMemory.heapUsed) /
                        1024 /
                        1024
                    ).toFixed(2)}MB`,
                    status: response.status || 200,
                }
            );

            return response;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            console.error(
                `❌ ${method} ${url.pathname} - ${duration.toFixed(
                    2
                )}ms - ERROR:`,
                {
                    route: routeName,
                    duration: `${duration.toFixed(2)}ms`,
                    error: error.message,
                }
            );

            throw error;
        }
    };
}

// Input validation middleware
export function validateInput(schema) {
    return async (request) => {
        try {
            const body = await request.json();

            for (const [field, rules] of Object.entries(schema)) {
                const value = body[field];

                if (
                    rules.required &&
                    (value === undefined || value === null || value === "")
                ) {
                    throw new Error(`Field '${field}' is required`);
                }

                if (rules.type && value !== undefined) {
                    if (rules.type === "string" && typeof value !== "string") {
                        throw new Error(`Field '${field}' must be a string`);
                    }
                    if (rules.type === "number" && typeof value !== "number") {
                        throw new Error(`Field '${field}' must be a number`);
                    }
                    if (rules.type === "email" && typeof value === "string") {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            throw new Error(
                                `Field '${field}' must be a valid email`
                            );
                        }
                    }
                }

                if (
                    rules.minLength &&
                    value &&
                    value.length < rules.minLength
                ) {
                    throw new Error(
                        `Field '${field}' must be at least ${rules.minLength} characters`
                    );
                }

                if (
                    rules.maxLength &&
                    value &&
                    value.length > rules.maxLength
                ) {
                    throw new Error(
                        `Field '${field}' must be no more than ${rules.maxLength} characters`
                    );
                }
            }

            return body;
        } catch (error) {
            if (error.message.includes("JSON")) {
                throw new Error("Invalid JSON in request body");
            }
            throw error;
        }
    };
}

export function withCors(handler, options = {}) {
    const {
        origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders = ["Content-Type", "Authorization", "X-Requested-With"],
        credentials = true,
    } = options;

    return async (request, context) => {
        // Handle preflight requests
        if (request.method === "OPTIONS") {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": methods.join(", "),
                    "Access-Control-Allow-Headers": allowedHeaders.join(", "),
                    "Access-Control-Allow-Credentials": credentials.toString(),
                    "Access-Control-Max-Age": "86400", // 24 hours
                },
            });
        }

        // Handle actual requests
        const response = await handler(request, context);

        if (response instanceof NextResponse) {
            response.headers.set("Access-Control-Allow-Origin", origin);
            response.headers.set(
                "Access-Control-Allow-Credentials",
                credentials.toString()
            );
        }

        return response;
    };
}

export function createApiRoute(handler, options = {}) {
    const {
        routeName = "unknown",
        rateLimit: rateLimitOptions,
        validation,
        requireAuth = true,
        cors: corsOptions,
    } = options;

    let wrappedHandler = handler;

    if (corsOptions) {
        wrappedHandler = withCors(wrappedHandler, corsOptions);
    }

    // Apply performance monitoring
    wrappedHandler = withPerformanceMonitoring(wrappedHandler, routeName);

    // Apply rate limiting if configured
    if (rateLimitOptions) {
        const rateLimiter = rateLimit(rateLimitOptions);
        const originalHandler = wrappedHandler;
        wrappedHandler = async (request, context) => {
            try {
                const rateInfo = rateLimiter(request);
                const response = await originalHandler(request, context);

                // Add rate limit headers
                if (response instanceof NextResponse) {
                    response.headers.set(
                        "X-RateLimit-Remaining",
                        rateInfo.remaining.toString()
                    );
                    response.headers.set(
                        "X-RateLimit-Reset",
                        rateInfo.resetTime.toISOString()
                    );
                }

                return response;
            } catch (error) {
                if (error.message.includes("Rate limit")) {
                    return handleApiError(error, { type: "RATE_LIMITED" });
                }
                throw error;
            }
        };
    }

    // Apply input validation if configured
    if (validation) {
        const validator = validateInput(validation);
        const originalHandler = wrappedHandler;
        wrappedHandler = async (request, context) => {
            if (request.method !== "GET" && request.method !== "DELETE") {
                try {
                    const validatedBody = await validator(request);
                    // Attach validated body to request for use in handler
                    request.validatedBody = validatedBody;
                } catch (error) {
                    return handleApiError(error, { type: "VALIDATION_ERROR" });
                }
            }
            return originalHandler(request, context);
        };
    }

    // Apply error handling wrapper
    return async (request, context) => {
        try {
            return await wrappedHandler(request, context);
        } catch (error) {
            return handleApiError(error, {
                route: routeName,
                method: request.method,
                url: request.url,
            });
        }
    };
}

export default {
    handleApiError,
    rateLimit,
    withPerformanceMonitoring,
    validateInput,
    withCors,
    createApiRoute,
};
