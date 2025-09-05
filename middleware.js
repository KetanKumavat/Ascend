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

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { userId, orgId } = auth();
  const { pathname } = req.nextUrl;

  // If user is not authenticated and trying to access protected routes
  if (!userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn();
  }

  // If user is authenticated
  if (userId) {
    // If user doesn't have an org and is not on onboarding or home page
    if (!orgId && pathname !== "/onboarding" && pathname !== "/") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // If user has an org and is on the home page, redirect to organization dashboard
    if (orgId && pathname === "/") {
      return NextResponse.redirect(new URL(`/organization/${orgId}`, req.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
