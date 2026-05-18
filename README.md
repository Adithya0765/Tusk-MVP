# TUSK — AI Debate & Analysis Sessions

TUSK is a web app where two AI models debate or analyze a topic in real-time, and you watch it unfold like a live meeting. Pick a topic, choose debate or analysis mode, and watch Gemini and Grok go back and forth. When they're done, you get a structured verdict with key points, tensions, and a final assessment.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Meeting Experience](#meeting-experience)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [Deployment](#deployment)

---

## Features

- **Live AI debates** — two models argue FOR and AGAINST a topic in real-time
- **Analysis mode** — models explore strengths and challenges of an idea instead of debating
- **Typewriter effect** — watch each agent's response appear character-by-character as they "speak"
- **Active speaker detection** — the current speaker's panel glows and shows a "Speaking" badge
- **Live transcript sidebar** — scrollable chat view of the full conversation
- **Progress tracking** — navbar shows current round and visual progress bar
- **Auto-verdict** — when the debate ends, the verdict overlay appears automatically
- **Structured verdict** — executive summary, key points for/against, unresolved tensions, confidence level
- **Export** — download as Markdown or PDF, share via link
- **Multi-provider AI** — Groq, Gemini, OpenRouter, Claude (configurable)
- **Tier-based quotas** — free, starter, and pro tiers with different round limits

---

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

```
User enters a topic + picks mode (Debate or Analysis)
        │
        ▼
POST /api/debate/start → creates session (status: "processing")
        │
        ▼
runDebateAndPersist() fires in background
        │
        ├── Round 1: Agent A responds → persisted immediately
        ├── Round 1: Agent B responds → persisted immediately
        ├── Round 2: Agent A responds → persisted immediately
        ├── Round 2: Agent B responds → persisted immediately
        │   ...
        │
        └── Conclusion agent generates structured JSON verdict
                │
                ▼
        Session marked "complete"
```

The client polls `/api/debate/[id]` every 2 seconds. As each turn is persisted, the UI detects the new turn and triggers the typewriter effect on both the agent panel and the chat sidebar.

---

## Meeting Experience

### During the Debate

The meeting page (`/debate/[id]`) is a **fixed-height, no-scroll** layout:

- **Two agent panels** side-by-side showing each model's latest response with a live typewriter effect
- **Active speaker glow** — the panel of the agent currently "typing" gets a subtle glow and a "Speaking" badge
- **Progress bar** in the navbar showing `Round X / Y`
- **Transcript sidebar** on the right with auto-scrolling chat log of all turns

### When the Debate Ends

1. The navbar status changes to "Compiling verdict..."
2. After ~800ms, a **full-screen overlay** slides in with the verdict
3. The verdict is at the **top of the overlay** — no scrolling needed to see it
4. Verdict sections: Final Verdict → Executive Summary → Key Points → Unresolved Tensions
5. Action buttons: Download Markdown, Download PDF, Share Link
6. "Close" button returns to dashboard

---

## Project Structure

```
/
├── app/
│   ├── (auth)/                 # Clerk auth (sign-in, sign-up)
│   ├── api/
│   │   ├── debate/
│   │   │   ├── start/route.ts  # Creates session, starts debate
│   │   │   └── [id]/route.ts   # Polling endpoint for session data
│   │   └── ...                 # Other API routes (webhooks, cron, etc.)
│   ├── debate/
│   │   ├── new/page.tsx        # Create new session form
│   │   └── [id]/page.tsx       # Live meeting UI (main page)
│   ├── share/[id]/page.tsx     # Public share page for completed debates
│   ├── dashboard/              # User dashboard with session list
│   ├── layout.tsx
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles + keyframe animations
├── components/
│   ├── debate/
│   │   ├── TurnBubble.tsx      # Individual turn display (share page)
│   │   ├── ConclusionPanel.tsx # Verdict panel with export options
│   │   └── TypewriterText.tsx  # Character-by-character typewriter effect
│   ├── sections/               # Landing page sections
│   ├── ui/                     # shadcn/ui components
│   └── ...                     # Background effects, text animations
├── lib/
│   ├── debate-engine.ts        # Core debate orchestration logic
│   ├── ai-provider.ts          # AI provider router (Groq, Gemini, etc.)
│   ├── dev-store.ts            # In-memory dev store (sessions, turns, conclusions)
│   ├── grok.ts                 # Groq/xAI API client
│   ├── gemini.ts               # Google Gemini API client
│   ├── openrouter.ts           # OpenRouter API client
│   ├── supabase.ts             # Supabase client (prod)
│   └── ...
├── types/
│   └── index.ts                # TypeScript type definitions
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Motion (motion/react) |
| **Auth** | Clerk |
| **Database (dev)** | In-memory store (`dev-store.ts`) |
| **Database (prod)** | Supabase |
| **AI Providers** | Groq (primary), Gemini, OpenRouter, Claude |
| **Payments** | Stripe |
| **Email** | Resend |
| **Testing** | Vitest + fast-check |

---

## Configuration

### Tier Limits (`types/index.ts`)

```typescript
export const TIER_CONFIG: Record<Tier, TierConfig> = {
  free:    { tier: 'free',    label: 'Explorer', priceINR: 0,   quotaLimit: 9999, rounds: 4 },
  starter: { tier: 'starter', label: 'Builder',  priceINR: 299, quotaLimit: 20,   rounds: 3 },
  pro:     { tier: 'pro',     label: 'Pro',      priceINR: 799, quotaLimit: 60,   rounds: 5 },
}
```

### Debate Limits

```typescript
export const DEBATE_LIMITS = {
  MAX_TOKENS_PER_TURN:    300,
  MAX_TURNS_PER_SESSION:  12,
  MAX_TOPIC_LENGTH:       500,
  MAX_CONCURRENT_DEBATES: 3,
  MAX_RETRIES:            3,
} as const
```

### AI Providers (`lib/ai-provider.ts`)

Configure which models act as Agent A and Agent B. Default:
- **Agent A** (FOR/Analyst): Gemini
- **Agent B** (AGAINST/Critic): Grok

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import on [Vercel](https://vercel.com/new)
3. Add environment variables for AI providers, Supabase, Clerk, Stripe, etc.
4. Deploy

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Groq/xAI API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `CLERK_SECRET_KEY` | Clerk auth |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `STRIPE_SECRET_KEY` | Stripe payments |

---

## License

MIT
