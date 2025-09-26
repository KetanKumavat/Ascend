import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    "/onboarding(.*)",
    "/organization(.*)",
    "/project(.*)",
    "/issue(.*)",
    "/sprint(.*)",
    "/meeting(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, orgId } = await auth();
    const { pathname } = req.nextUrl;

    if (!userId && isProtectedRoute(req)) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
    }

    if (userId) {
        if (!orgId && pathname !== "/onboarding") {
            return NextResponse.redirect(new URL("/onboarding", req.url));
        }

        if (orgId && pathname === "/") {
            return NextResponse.redirect(
                new URL(`/organization/${orgId}`, req.url)
            );
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|sw\\.js|manifest\\.json|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
