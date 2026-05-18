# Implementation Plan: TUSK MVP

## Overview

Build the TUSK AI debate platform on top of the existing Next.js 14 codebase. The implementation follows a 4-week sequence: core engine first, then full product pages, then payments and email, then polish and tests. All code is TypeScript. The existing `components/ui/`, `components/motion-primitives/`, Tailwind config, and `lib/utils.ts` are reused throughout.

---

## Tasks

- [x] 1. Install dependencies and configure environment
  - Installed `@clerk/nextjs @supabase/supabase-js @anthropic-ai/sdk stripe @stripe/stripe-js resend svix nanoid` via npm
  - Installed `@google/generative-ai` for Gemini; `@anthropic-ai/sdk` for optional Claude upgrade
  - Installed `vitest @vitest/ui` as dev dependencies; created `vitest.config.ts` at project root
  - Created `.env.local` with all keys: Gemini (5 keys), Grok (5 keys), Claude toggle, Clerk, Supabase, Stripe, Resend, Cron, App URL
  - Wrapped `app/layout.tsx` with `<ClerkProvider>`; added `<Toaster />` from `sonner`
  - Created `middleware.ts` protecting `/dashboard`, `/debate/:path*`, `/settings`, `/api/debate/:path*`, `/api/subscription/:path*`, `/api/user/:path*`
  - Created `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 2. Add TypeScript types and constants
  - Extended `types/index.ts` with `Tier`, `SessionStatus`, `Agent`, `NotificationStatus`, `TierConfig`, `DbUser`, `DbSession`, `DbTurn`, `DbConclusion`, `ConclusionData` and the `TIER_CONFIG` / `DEBATE_LIMITS` constants
  - _Requirements: 4.2, 4.3, 7.1, 11.1, 11.2_

- [x] 3. Create Supabase migrations (all 5 tables + RLS)
  - Created `supabase/migrations/001_initial.sql` with all 5 tables, `updated_at` trigger on sessions, and full RLS policies
  - _Requirements: 1.3, 2.1, 4.6, 9.3_

- [x] 4. Implement `lib/` modules
  - [x] 4.1 Create `lib/key-manager.ts`
    - Manages up to 5 API keys per provider (Gemini, Grok)
    - Tracks `requestsThisMinute` and `requestsToday` per key; resets counters automatically
    - Blocks keys for 65 seconds on 429; exports `getGeminiKey()`, `getGrokKey()`, `markKeyRateLimited()`
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 4.2 Create `lib/gemini.ts`
    - Wraps `@google/generative-ai`; uses model `gemini-2.0-flash`
    - Calls `getGeminiKey()` per request; on 429 calls `markKeyRateLimited` and retries recursively (up to 3 times)
    - _Requirements: 4.1, 4.3, 12.2_

  - [x] 4.3 Create `lib/grok.ts`
    - Calls `https://api.x.ai/v1/chat/completions` via fetch; model `grok-3-mini`; `max_tokens: 400`
    - Calls `getGrokKey()` per request; on 429 calls `markKeyRateLimited` and retries recursively (up to 3 times)
    - _Requirements: 4.1, 4.3, 12.2_

  - [x] 4.4 Create `lib/ai-provider.ts`
    - Exports `callAgentA`, `callAgentB`, `callConclusion`, `getAgentNames`
    - Agent A = Gemini (or Claude when `CLAUDE_ENABLED=true` + `ANTHROPIC_API_KEY` set)
    - Agent B = Grok (always)
    - Claude loaded via dynamic import to avoid bundle cost when disabled
    - _Requirements: 4.1, 12.5_

  - [x] 4.5 Create `lib/debate-engine.ts`
    - Exports `runDebate(topic, rounds): Promise<DebateResult>`
    - Imports only from `lib/ai-provider.ts` — no direct AI SDK imports
    - Builds FOR/AGAINST system prompts; references opponent's previous arguments from round 2 onward
    - Loops rounds: `callAgentA` (FOR) → `callAgentB` (AGAINST); enforces `MAX_TURNS_PER_SESSION=12` guard
    - Wraps each call in `callWithRetry` (3 retries, exponential backoff 1s/2s/4s)
    - After all rounds: calls `callConclusion` with full transcript; parses JSON conclusion (strips markdown fences)
    - Returns `{ turns, conclusion }` — Supabase persistence handled by the API route caller
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 4.6 Create `lib/supabase.ts`
    - Export `createServerClient()` using `SUPABASE_SERVICE_ROLE_KEY` (for API routes and engine)
    - Export `createBrowserClient()` using the anon key (for client components)
    - _Requirements: 1.3, 4.6_

  - [x] 4.7 Create `lib/quota.ts`
    - Export `checkQuota(userId: string): Promise<{allowed: boolean, used: number, limit: number}>`
    - Export `decrementQuota(userId: string): Promise<void>` — increments `quota_used` by 1
    - Export `resetMonthlyQuota(userId: string): Promise<void>` — sets `quota_used=0`, `quota_limit` to tier config value, updates `quota_reset_at`
    - Use service-role Supabase client
    - _Requirements: 3.4, 4.8, 7.6_

  - [x] 4.8 Create `lib/stripe.ts`
    - Export `createCheckoutSession(userId: string, tier: 'starter' | 'pro', returnUrl: string): Promise<string>` returning the Stripe checkout URL
    - Export `constructStripeEvent(body: string, sig: string): Stripe.Event`
    - _Requirements: 7.2, 7.5_

  - [x] 4.9 Create `lib/resend.ts`
    - Export `sendDebateNotification(to: string, sessionId: string, status: 'complete' | 'failed'): Promise<{success: boolean, error?: string}>`
    - Send email with subject and a link to `/debate/[sessionId]`
    - Log result to `notifications_log` table via service-role client
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 5. Checkpoint — Ensure lib modules compile without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement API routes
  - [x] 6.1 Create `app/api/webhooks/clerk/route.ts`
    - Verify Svix signature using `CLERK_WEBHOOK_SECRET`; return HTTP 400 on failure without touching DB
    - On `user.created` event: INSERT into `users` table with Clerk user ID, email, default tier `free`, `quota_limit=3`, `quota_reset_at` = first day of next month
    - Return HTTP 200 on success
    - _Requirements: 1.3, 1.4_

  - [x] 6.2 Create `app/api/webhooks/stripe/route.ts`
    - Verify Stripe webhook signature; return HTTP 400 on failure
    - On `checkout.session.completed`: update user's `tier`, `stripe_customer_id`, `stripe_subscription_id`, reset `quota_used=0`, set `quota_limit` from `TIER_CONFIG`
    - On `customer.subscription.deleted`: downgrade user to `tier='free'`, set `quota_limit=3`
    - _Requirements: 7.3, 7.4, 7.5_

  - [x] 6.3 Create `app/api/debate/start/route.ts`
    - Authenticate via Clerk `auth()`; return 401 if unauthenticated
    - Validate topic: empty → 422 `TOPIC_EMPTY`, >500 chars → 422 `TOPIC_TOO_LONG`
    - Check quota via `checkQuota`; exhausted → 422 `QUOTA_EXHAUSTED`
    - Check concurrent processing sessions count ≥ 3 → 422 `CONCURRENCY_LIMIT`
    - INSERT session with `status='processing'`, `rounds` from user's tier config, generate `share_slug` (nanoid)
    - Fire-and-forget: call `runDebate(topic, rounds)` from `lib/debate-engine.ts`, then persist turns/conclusion and update session status — do not await in the HTTP handler
    - Return HTTP 201 `{sessionId}`
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 11.3, 11.4, 11.5_

  - [x] 6.4 Create `app/api/debate/[id]/route.ts`
    - Authenticate; verify session belongs to authenticated user — return 404 if not found or wrong owner
    - Return full session data including all turns and conclusion
    - _Requirements: 5.2, 5.6_

  - [x] 6.5 Create `app/api/debate/[id]/status/route.ts`
    - Authenticate; verify ownership — return 404 on mismatch
    - Return lightweight `{status, turns?, conclusion?}` — include turns and conclusion only when status is `complete`
    - _Requirements: 5.1, 5.6_

  - [x] 6.6 Create `app/api/subscription/checkout/route.ts`
    - Authenticate; call `createCheckoutSession` with user ID, requested tier, and return URL
    - Return `{url}` for client-side redirect
    - _Requirements: 7.2_

  - [x] 6.7 Create `app/api/user/me/route.ts`
    - GET: return authenticated user's profile from `users` table
    - PATCH: accept `{display_name?, notify_email?}`, update `users` table, return updated record
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Checkpoint — Ensure all API routes compile and return correct status codes for happy paths
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build debate UI components
  - [x] 8.1 Create `components/debate/TurnBubble.tsx`
    - Display a single agent turn with a FOR (Agent A / Gemini or Claude) or AGAINST (Agent B / Grok) badge
    - Agent name displayed dynamically — read from turn data, not hardcoded
    - Use existing `Card` component; style FOR in blue tones, AGAINST in amber tones
    - _Requirements: 5.2_

  - [x] 8.2 Create `components/debate/ConclusionPanel.tsx`
    - Display the structured conclusion with labelled sections: Executive Summary, Key Points FOR, Key Points AGAINST, Unresolved Tensions, Final Verdict, Confidence Level
    - Include a "Download as Markdown" button that generates and downloads a `.md` file containing the full transcript and conclusion
    - Include a "Download as PDF" button using `jsPDF` (browser-side, no server needed) generating the same content as a PDF
    - Include a share button that copies `/share/[share_slug]` to clipboard and shows a `sonner` toast confirmation
    - _Requirements: 5.2, 5.4, 5.5_

  - [x] 8.3 Create `components/debate/DebateCard.tsx`
    - Session card showing topic (truncated to 80 chars), status badge (Processing / Complete / Failed with colour coding), and formatted creation date
    - Entire card is a link to `/debate/[id]`
    - _Requirements: 2.3, 2.4_

  - [x] 8.4 Create `components/dashboard/UsageBar.tsx`
    - Quota progress bar using `@radix-ui/react-progress`
    - Display "X / Y debates used this month" label
    - _Requirements: 2.1_

  - [x] 8.5 Create `components/dashboard/SessionList.tsx`
    - Render a list of `DebateCard` components
    - Show empty-state with a "Start your first debate →" CTA when list is empty
    - _Requirements: 2.2, 2.3_

  - [x] 8.6 Create `components/shared/PricingTable.tsx`
    - Three-column layout for Free / Starter / Pro tiers using `TIER_CONFIG`
    - Show price in INR, quota limit, round count, and an upgrade `Button`
    - Upgrade button calls `POST /api/subscription/checkout` for paid tiers; links to `/sign-up` for guests
    - _Requirements: 7.1, 7.2_

- [x] 9. Build application pages
  - [x] 9.1 Update `app/page.tsx` — Landing page
    - Replace placeholder content with TUSK-specific copy: hero headline "Submit a topic, 2 AI models debate it, you get a structured conclusion"
    - Reuse existing `TextEffect`, `AnimatedGroup`, `Button`, `HeroSection`, `CallToAction` components; adapt copy and CTAs for TUSK
    - Include a "How It Works" section (3 steps: Submit topic → Watch debate → Download conclusion) reusing existing step/feature components
    - Include a hardcoded demo debate result section so visitors see sample output before signing up (Req 10.1)
    - Include a pricing summary section reusing `PricingTable`
    - Primary CTA links to `/sign-up`; footer links to Twitter/X, GitHub, Terms, Privacy
    - _Requirements: 10.1, 10.2_

  - [x] 9.2 Create `app/dashboard/page.tsx`
    - Server component: fetch user's sessions and quota from Supabase using service-role client + Clerk `auth()`
    - Render `UsageBar` and `SessionList`
    - Add a "New Debate" button linking to `/debate/new`
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 9.3 Create `app/debate/new/page.tsx`
    - Client component with a `<textarea>` (max 500 chars), live character counter, and submit button
    - On submit: POST to `/api/debate/start`; handle 422 error codes with user-facing messages (quota exhausted → show upgrade prompt, concurrency → show "too many active debates" message)
    - On success: redirect to `/debate/[id]`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 9.4 Create `app/debate/[id]/page.tsx`
    - Client component: fetch initial session data from `/api/debate/[id]`
    - If status is `processing`: show spinner and poll `/api/debate/[id]/status` every 5 seconds using `setInterval`; stop polling when status changes
    - If status is `complete`: render all `TurnBubble` components followed by `ConclusionPanel`
    - If status is `failed`: show error message with a "Try again" link to `/debate/new`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 9.5 Create `app/share/[id]/page.tsx`
    - Server component: fetch session by `share_slug` using service-role client (no auth required)
    - If status is not `complete`: render "This debate is not yet available" message
    - If session not found: `notFound()` (renders 404)
    - If complete: render topic, all turns via `TurnBubble`, and `ConclusionPanel` (download/share buttons hidden)
    - Add Open Graph metadata: `title = session.topic`, `description = "AI debate on TUSK"`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 9.6 Create `app/pricing/page.tsx`
    - Render `PricingTable` component
    - Add page-level Open Graph metadata
    - _Requirements: 7.1, 7.2_

  - [x] 9.7 Create `app/settings/page.tsx`
    - Client component: fetch user profile from `/api/user/me`
    - Editable display name field with a save button (PATCH `/api/user/me`)
    - Email notification toggle that fires PATCH immediately on change (no separate save)
    - Show success/error toasts via `sonner`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10. Update header navigation for authenticated state
  - Modify `components/header.tsx` to show "Dashboard", "New Debate", "Pricing" links and a user avatar/sign-out button when signed in (use `useUser` from `@clerk/nextjs`)
  - Show "Sign In" / "Get Started" buttons when signed out
  - _Requirements: 1.2, 2.4_

- [x] 11. Checkpoint — Ensure all pages render without runtime errors and navigation works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Stripe products and pricing page checkout flow
  - Add `pnpm add jspdf` for browser-side PDF generation (used in `ConclusionPanel`)
  - Create two Stripe products in the Stripe dashboard (Starter ₹299/month, Pro ₹799/month) and record their Price IDs in `.env.local` as `STRIPE_STARTER_PRICE_ID` and `STRIPE_PRO_PRICE_ID`
  - Update `lib/stripe.ts` `createCheckoutSession` to use the correct Price ID based on the requested tier; set `currency: 'inr'` and `mode: 'subscription'`
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 13. Add monthly quota reset mechanism
  - Create `app/api/cron/reset-quotas/route.ts` — a GET handler that iterates all users whose `quota_reset_at <= now()`, calls `resetMonthlyQuota` for each, and returns a count
  - Add `vercel.json` with a cron entry running `GET /api/cron/reset-quotas` daily at midnight UTC
  - Protect the cron route with a `CRON_SECRET` env var check (compare `Authorization: Bearer` header)
  - _Requirements: 7.6_

- [x] 14. Add mobile responsiveness and error states
  - Audit all new pages and components for mobile layout (≤ 640px): ensure `textarea`, cards, and pricing table stack correctly
  - Add a global error boundary `app/error.tsx` and a not-found page `app/not-found.tsx`
  - Add loading skeletons `app/dashboard/loading.tsx` and `app/debate/[id]/loading.tsx`
  - _Requirements: 5.3, 6.3_

- [x] 15. Add Open Graph metadata to landing page
  - Update `app/layout.tsx` metadata with `openGraph` fields: title, description, and image pointing to `/api/og`
  - Update `app/api/og/route.tsx` to render a TUSK-branded OG image
  - _Requirements: 10.4_

- [x] 16. Implement property-based tests with fast-check
  - Create `__tests__/properties/` directory; `vitest` and `vitest.config.ts` already added in task 1

  - [x] 16.1 Write property test for topic length validation symmetry
    - Import `validateTopicClient` and `validateTopicServer` (pure functions extracted from form and API route)
    - Generate arbitrary strings of length 0–1000 with `fc.string()`
    - Assert `validateTopicClient(s) === validateTopicServer(s)` for all inputs
    - **Property 1: Topic length validation is symmetric**
    - **Validates: Requirements 3.3, 11.4**

  - [x] 16.2 Write property test for quota decrement is bounded
    - Generate a user with random tier and a random sequence of session completions/failures using `fc.record` + `fc.array`
    - Assert `quota_used <= quota_limit` after each operation and `quota_used` equals count of terminal sessions
    - **Property 2: Quota decrement is bounded**
    - **Validates: Requirements 4.8, 7.6**

  - [x] 16.3 Write property test for turn token count is bounded
    - Generate random debate topics and mock AI responses with `fc.string()`
    - Assert every turn's `token_count <= 300` (`MAX_TOKENS_PER_TURN`)
    - **Property 3: Turn token count is bounded**
    - **Validates: Requirements 4.3, 11.1**

  - [x] 16.4 Write property test for turn count per session is bounded
    - Generate sessions for each tier with mocked AI using `fc.constantFrom('free', 'starter', 'pro')`
    - Assert total turns ≤ 12 and equals `rounds * 2` for complete sessions
    - **Property 4: Turn count per session is bounded**
    - **Validates: Requirements 4.2, 4.4, 11.2**

  - [x] 16.5 Write property test for conclusion exists iff session is complete
    - Simulate session lifecycle transitions with `fc.oneof` for status values
    - Assert conclusion presence invariant holds after each state change
    - **Property 5: Conclusion exists iff session is complete**
    - **Validates: Requirements 4.5, 4.6**

  - [x] 16.6 Write property test for shared view requires complete status
    - Generate sessions with random statuses using `fc.constantFrom('processing', 'complete', 'failed')`
    - Assert share route returns viewable content if and only if status is `complete`
    - **Property 6: Shared view requires complete status**
    - **Validates: Requirements 6.1, 6.2**

  - [x] 16.7 Write property test for notification log completeness
    - Generate sessions transitioning to `complete`/`failed` with `notify_email=true`
    - Assert a `notifications_log` row exists for each terminal session
    - **Property 7: Notification log completeness**
    - **Validates: Requirements 9.1, 9.2, 9.3**

  - [x] 16.8 Write property test for limit violations return HTTP 422
    - Generate requests violating each server-side limit (topic > 500 chars, quota exhausted, concurrency ≥ 3)
    - Assert HTTP 422 with a descriptive error code for all violations
    - **Property 8: Limit violations return HTTP 422**
    - **Validates: Requirements 11.3, 11.5**

  - [x] 16.9 Write property test for quota reset matches tier config
    - Generate users with random tiers using `fc.constantFrom('free', 'starter', 'pro')`
    - Run `resetMonthlyQuota`; assert `quota_used=0` and `quota_limit` matches `TIER_CONFIG[tier].quotaLimit`
    - **Property 9: Quota reset matches tier config**
    - **Validates: Requirements 7.6**

  - [x] 16.10 Write property test for session ownership enforces 404
    - Generate `(userId, sessionId)` pairs where `userId !== session.user_id` using `fc.tuple(fc.string(), fc.string())`
    - Assert HTTP 404 from `/api/debate/[id]` and `/api/debate/[id]/status`
    - **Property 10: Session ownership enforces 404**
    - **Validates: Requirements 5.6**

  - [x] 16.11 Write property test for webhook signature rejection
    - Generate arbitrary payloads with invalid/missing signatures for Clerk and Stripe endpoints
    - Assert HTTP 400 and no DB mutations for all invalid-signature requests
    - **Property 11: Webhook signature rejection**
    - **Validates: Requirements 1.4, 7.5**

- [x] 17. Final checkpoint — Ensure all tests pass and build succeeds
  - Run `pnpm build` to verify no TypeScript or build errors
  - Run `pnpm vitest --run` to verify all property tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The existing `components/ui/`, `components/motion-primitives/`, and `lib/utils.ts` are reused throughout — do not recreate them
- **AI providers**: Agent A = Gemini 2.0 Flash (free), Agent B = Grok 3 Mini (free). Claude is a zero-code upgrade: set `CLAUDE_ENABLED=true` + `ANTHROPIC_API_KEY`
- **No openai package**: GPT-4o was replaced by Grok. Do not add the `openai` npm package
- **No Vertex AI**: Do not add `@google-cloud/vertexai` or any Vertex AI references
- `lib/key-manager.ts`, `lib/gemini.ts`, `lib/grok.ts`, `lib/ai-provider.ts`, `lib/debate-engine.ts` are already implemented
- Property tests (16.1–16.11) correspond 1-to-1 with the 11 Correctness Properties in `design.md`
- The debate engine runs fire-and-forget inside the API route with `maxDuration=60` on the Vercel function
- Supabase RLS is the primary data-access guard; API-layer ownership checks are a second layer
