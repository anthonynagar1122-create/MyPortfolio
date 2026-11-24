import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/((?!_next|.*\\.[\\w]+$).*)", // All pages except Next.js internals and static files
]);

export default clerkMiddleware(async (auth, req) => {
  // Only require auth for truly protected routes (none for now - routes are public by default)
  // Protected routes can be added here as needed
  if (false) {
    // Placeholder: add protected routes as business logic requires
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in public folder
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // However, rewrite all files in the public folder to `/_next/static` files
    "/(public)?(.*)",
  ],
};
