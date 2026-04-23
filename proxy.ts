import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/checkout",
  "/orders(.*)",
  "/checkout/success",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/studio(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  
  const isAdmin = role === "admin";

  // 1. Auth protection
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 2. Admin protection
  if (isAdminRoute(req)) {
    await auth.protect();

    if (!isAdmin) {
      // safest option: hide route completely
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
