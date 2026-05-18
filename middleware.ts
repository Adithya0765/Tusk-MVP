import { clerkMiddleware } from '@clerk/nextjs/server'

// For the MVP, we skip authentication checks to allow dev testing with DEV_USER_ID
export default clerkMiddleware(async (auth, req) => {
  // Routes are intentionally left unprotected for local Dev/MVP mode
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
