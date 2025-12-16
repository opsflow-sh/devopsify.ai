# DevOpsify.ai - Complete Build Handoff for Claude Code

This document defines exactly what to build, in what order, with clear contracts and examples.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Setup](#database-setup)
3. [Phase 1: Core Services](#phase-1-core-services)
4. [Phase 2: API Routes](#phase-2-api-routes)
5. [Phase 3: Frontend Components](#phase-3-frontend-components)
6. [Phase 4: Advanced Features](#phase-4-advanced-features)
7. [Type Contracts](#type-contracts)
8. [API Contracts](#api-contracts)

---

## Architecture Overview

```
DevOpsify.ai is built in three layers:

Frontend (React + Vite)
├── Marketing site (complete)
└── App (authenticated, multi-stage)
    ├── FTUE (First Time User Experience)
    ├── Watch Mode Dashboard
    └── Production+ Features

Backend (Express + TypeScript)
├── Database (PostgreSQL directly, no ORM yet)
├── Services (Analysis, Judgment, Alerts)
├── Routes (API endpoints)
└── External (Stripe, GitHub API)

Shared (TypeScript)
└── Types (Single source of truth for contracts)
```

---

## Database Setup

### Prerequisites

- PostgreSQL 13+ (local or remote)
- Environment variable: `DATABASE_URL=postgresql://user:password@host:port/dbname`

### Step 1: Create Database

```bash
createdb devopsify
```

### Step 2: Run Schema

Execute the SQL in `server/db/schema.sql` to create all tables:

- `users` - User accounts
- `app_analyses` - Analysis records
- `watch_mode_subscriptions` - Subscriptions
- `alerts` - Alert history
- `prepared_changes` - Generated changes
- `pricing_plans` - Pricing tiers
- `subscriptions` - Stripe subscriptions
- `sessions` - Session tokens

### Step 3: Seed Reference Data

Insert these into `risk_scenarios`, `platform_recommendations`, `next_best_steps`:

**risk_scenarios** (top 5 for MVP):

```sql
INSERT INTO risk_scenarios (title, plain_explanation, trigger_condition, user_symptom, severity, "order")
VALUES
('Slower responses under heavy use', 'If ~100+ people use this at once, requests may start timing out.', 'high_concurrent_writes', 'Pages feel slow or fail to load', 'high', 1),
('Surprise cost increase', 'If traffic jumps suddenly, your monthly cost could rise faster than expected.', 'serverless_spike', 'Unexpected bill increase', 'high', 2),
('External dependency risk', 'If a third-party API is slow, parts of your app may feel broken.', 'external_api_down', 'Entire feature stops working', 'medium', 3),
('Database contention', 'Multiple requests writing at once may cause locks and delays.', 'write_heavy', 'Intermittent slowdowns during activity spikes', 'medium', 4),
('Long-running tasks block users', 'Background work running in the same process as user requests.', 'background_jobs_sync', 'App freezes during heavy background work', 'high', 5);
```

**platform_recommendations** (at least Replit for MVP):

```sql
INSERT INTO platform_recommendations (platform_id, platform_name, recommended_badge, why_bullets, when_it_changes, confidence_note)
VALUES
('replit', 'Replit Deployments', '✅ Recommended right now',
 '["Handles your current usage well", "Keeps things simple while you grow"]',
 'If usage grows 5–10×, this setup may need an upgrade.',
 'You''re not missing out by staying here.');
```

**next_best_steps** (3 variants for MVP):

```sql
INSERT INTO next_best_steps (mode, headline, explanation, cta_text, upgrade_required)
VALUES
('do_nothing', 'Nothing right now.', 'You''re in a good place. Focus on your product.', 'We can watch this for you', FALSE),
('watch_one_thing', 'Keep an eye on database usage.', 'If this changes, we''ll let you know.', 'Enable Watch Mode', FALSE),
('small_upgrade', 'Before charging users, switch to a managed database.', 'This reduces contention and makes growth smoother.', 'Show me the upgrade', TRUE);
```

**pricing_plans** (3 tiers for MVP):

```sql
INSERT INTO pricing_plans (name, price_cents, currency, billing_period, features, status, stripe_price_id)
VALUES
('Launch Check', 0, 'USD', 'monthly', '["App analysis", "Launch confidence", "Platform fit"]', 'active', NULL),
('Watch Mode', 1900, 'USD', 'monthly', '["Everything in Launch Check", "Continuous monitoring", "Confidence tracking", "Calm alerts"]', 'active', 'price_XXXXX'),
('Growth Guard', 4900, 'USD', 'monthly', '["Everything in Watch Mode", "Growth simulations", "Cost forecasting", "Next upgrade guidance"]', 'active', 'price_YYYYY');
```

---

## Phase 1: Core Services

These are the "intelligence" services that make DevOpsify unique. No UI yet.

### Service 1: Database Client

**File:** `server/db/client.ts`

```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function getOne<T>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const result = await query(text, params);
  return result.rows[0] || null;
}

export async function getMany<T>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await query(text, params);
  return result.rows;
}

export async function executeOne(text: string, params?: unknown[]) {
  await query(text, params);
}
```

**Contract:**

- Must use `pg` library (already in dependencies)
- Must support parameterized queries to prevent SQL injection
- Must handle connection pooling

### Service 2: App Understanding Engine

**File:** `server/services/appUnderstanding.ts`

**Input Contract:**

```typescript
interface AppContent {
  files: Map<string, string>; // filename -> file contents
  packageJson?: Record<string, unknown>;
  requirementsTxt?: string;
}
```

**Output Contract:**

```typescript
async function detectStack(appContent: AppContent): Promise<StackProfile>;
// Returns: { runtime, framework, database, databases[], external_apis[], has_background_jobs, has_file_uploads, deployment_platform }
// Examples:
// Node.js + Express + PostgreSQL = { runtime: 'node', framework: 'express', database: 'postgresql', ... }
// Python + Flask + SQLite = { runtime: 'python', framework: 'flask', database: 'sqlite', ... }

async function analyzePatterns(
  appContent: AppContent,
): Promise<BehaviorProfile>;
// Returns: { is_stateful, write_heavy, has_background_jobs, has_file_uploads, estimated_concurrency_risk, external_dependency_count }
// is_stateful: true if app stores state in memory, files, or sessions
// write_heavy: true if write operations > read operations significantly
// estimated_concurrency_risk: 'low' | 'medium' | 'high' based on database + patterns

async function parseZipUpload(zipBuffer: Buffer): Promise<AppContent>;
// Use 'unzipper' or 'adm-zip' library
// Skip: node_modules/, .git/, .next/, dist/, build/, __pycache__/
// Include: package.json, requirements.txt, main source files

async function cloneGitHubRepo(githubUrl: string): Promise<AppContent>;
// Use 'octokit' to fetch repo contents via GitHub API
// Recursively fetch up to 5MB of source code (skip binaries, large files)
// Cache the result for 10 minutes to avoid rate limits
```

**Implementation Notes:**

- Stack detection: Look for imports, dependencies, config files
- Pattern analysis: Count write/read patterns in code, search for specific libraries
- Must handle multiple stacks (Node, Python, Go, etc) but Node is priority
- Keep logic ~300 lines, not a monster file

### Service 3: Judgment Engine (The Moat)

**File:** `server/services/judgmentEngine.ts`

**Core Contract:**

```typescript
async function calculateLaunchConfidence(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
): Promise<{ score: number; factors: string[] }>;

// Algorithm:
// - Statefulness: stateless = +30, stateful = +10
// - Data handling: clean reads = +30, write-heavy = +10
// - Dependencies: < 3 = +20, 3-5 = +10, > 5 = +5
// - Concurrency: low = +20, medium = +10, high = +5
// Total: 0-100
//
// Example: 30 + 30 + 20 + 20 = 100 (safe)
// Example: 10 + 10 + 10 + 10 = 40 (not ready)

async function detectRisks(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
): Promise<RiskScenario[]>;

// Algorithm:
// 1. Load top 5 risks from risk_scenarios table
// 2. Score each by relevance to this app:
//    - Concurrent writes + SQLite = HIGH "Slower responses"
//    - Serverless + no caching = HIGH "Surprise cost"
//    - External deps > 3 = MEDIUM "External risk"
// 3. Return top 3 by severity
// 4. Plain English only, no DevOps words

async function recommendPlatform(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
  currentPlatform?: string,
): Promise<PlatformRecommendation>;

// Algorithm:
// 1. If currentPlatform provided and still fits = recommend staying
// 2. Else: recommend best match from platform_recommendations
// 3. Always explain "why this works" and "when it changes"
// Key: Never push migration, only guide when limit is hit

async function recommendNextStep(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
  stage: "mvp" | "watch" | "growth" | "production",
): Promise<NextBestStepRecommendation>;

// Algorithm:
// MVP stage: "do_nothing" or "watch_one_thing"
// Watch stage: "watch_one_thing" or "small_upgrade"
// Growth: "small_upgrade" (Phase 1)
// Production: multi-phase approach
//
// Key: ONE action only, never overwhelming
```

**Implementation Notes:**

- All outputs must be plain English, NO jargon (no "orchestration", "containerization", etc)
- Confidence score must be deterministic (same input = same output)
- Risks should be sorted by user impact, not technical severity
- Platform recommendation should be neutral (not pushing away from Replit)

### Service 4: Alert Orchestrator

**File:** `server/services/alertOrchestrator.ts`

**Contract:**

```typescript
async function evaluateAlerts(
  analysisId: string,
  userId: string,
  newProfile: BehaviorProfile,
  previousProfile?: BehaviorProfile,
): Promise<Alert[]>;

// Returns only alerts that SHOULD be sent, not all possible alerts
//
// Rules:
// 1. Max 1 alert per category per 7 days (check database)
// 2. Only fire if correlation >= 2 signals
// 3. Include reassurance text
//
// Categories:
// - 'usage_growth': Usage increased 2x in 24h or 3x in 7d
// - 'cost_risk': Cost slope > 1.5x usage slope
// - 'architecture_drift': Behavior changed (stateless -> stateful, etc)
// - 'platform_suitability': Approaching platform limits (80%)
// - 'stability_regression': Errors or latency increased 2x
//
// Each alert has: { category, severity, title, body, what_changed, next_step }
```

---

## Phase 2: API Routes

Connect services to HTTP endpoints.

### Route 1: POST /api/auth/signup

**File:** `server/routes/auth.ts`

```typescript
// Input: { email, password, name }
// Output: { userId, sessionToken }
//
// Logic:
// 1. Validate email format
// 2. Hash password (bcrypt)
// 3. Insert into users table
// 4. Create session record
// 5. Return userId + sessionToken
//
// Errors: 400 if email exists, 500 if DB fails
```

### Route 2: POST /api/analyze

**File:** `server/routes/analyze.ts`

```typescript
// Input: { github_url } OR { uploaded_file (multipart) }
// Output: { analysisId, status }
//
// Logic:
// 1. Validate: Either github_url XOR uploaded_file
// 2. Create app_analyses record with status='pending'
// 3. Call detectStack() + analyzePatterns()
// 4. Call generateLaunchVerdict()
// 5. Store results in database
// 6. Return { analysisId, verdict, risks, recommendation, nextStep }
//
// Async: Can be sync (< 10 seconds) or async with job queue (later)
```

### Route 3: GET /api/analyze/:analysisId

**File:** `server/routes/analyze.ts`

```typescript
// Input: URL param analysisId, auth header
// Output: { analysis, verdict, risks, platform_recommendation, next_best_step }
//
// Logic:
// 1. Fetch app_analyses by ID
// 2. Check authorization (user owns it)
// 3. Return full verdict + associated data
```

### Route 4: POST /api/analyze/:analysisId/recheck

**File:** `server/routes/analyze.ts`

```typescript
// Used in Watch Mode to re-run analysis
// Input: analysisId, auth header
// Output: { updated: true, verdict, newAlerts: Alert[] }
//
// Logic:
// 1. Fetch previous analysis
// 2. Re-download / re-parse repo
// 3. Re-run detectStack() + analyzePatterns()
// 4. Call evaluateAlerts(newProfile, oldProfile)
// 5. Return new verdict + alerts
```

### Route 5: POST /api/subscribe

**File:** `server/routes/stripe.ts`

```typescript
// Input: { analysisId, planId }
// Output: { checkoutUrl } OR { subscriptionId }
//
// Logic:
// 1. Fetch pricing_plans by planId
// 2. Call Stripe to create checkout session OR subscription
// 3. Store watch_mode_subscriptions record
// 4. Return checkout URL or subscription ID
```

### Route 6: GET /api/alerts

**File:** `server/routes/alerts.ts`

```typescript
// Input: auth header, query: { analysisId?, limit=20, offset=0 }
// Output: { alerts: Alert[], total }
//
// Logic:
// 1. Fetch alerts for current user
// 2. Optionally filter by analysisId
// 3. Return paginated results
```

---

## Phase 3: Frontend Components

Build the user-facing app, stage by stage.

### Shell Components

**File:** `client/components/app/AppShell.tsx`

```typescript
// Layout wrapper for authenticated app
// Props: { children, showNav?, activeStep? }
// Includes: TopNav, Sidebar, Footer
// Used by all /app/* pages
```

**File:** `client/components/app/ProgressIndicator.tsx`

```typescript
// Shows FTUE progress (Step 1-6)
// Props: { currentStep: 1 | 2 | 3 | 4 | 5 | 6, labels: string[] }
// Used on: Connect, Analyzing, LaunchVerdict, Risks, Platform, NextStep
```

### FTUE Pages (Priority 1)

**File:** `client/pages/app/Connect.tsx` (Route: /app/connect)

```typescript
// Screen 1: Connect your app
//
// Elements:
// - Form with 2 inputs: GitHub URL, ZIP upload
// - Helper text: "Read-only", "No cloud access", "Takes ~30 seconds"
// - Submit button: "Analyze my app"
// - On submit: Call POST /api/analyze
//   - Redirect to /app/analyzing?analysisId=XXX

// Must use:
// - react-hook-form for form state
// - /api/analyze endpoint
// - Loading state during submission
```

**File:** `client/pages/app/Analyzing.tsx` (Route: /app/analyzing)

```typescript
// Screen 2: Analysis in progress
//
// Elements:
// - Title: "Quick check in progress"
// - 3 animated steps:
//   1. Understanding how your app works
//   2. Checking what could go wrong
//   3. Making sure you're in the right place
// - Reassurance copy
// - Auto-redirect to /app/report/launch when done
//
// Must:
// - Poll GET /api/analyze/:analysisId every 2 seconds
// - Check for status === 'completed'
// - Redirect with verdict data
```

**File:** `client/pages/app/LaunchVerdict.tsx` (Route: /app/report/launch)

```typescript
// Screen 3: THE AHA MOMENT - "Is your app safe to share?"
//
// Elements:
// - Status badge: 🟢 Safe | 🟡 Mostly safe | 🔴 Not yet
// - Confidence meter: 72/100 with label
// - One-line summary
// - Button: "See what to watch for" → /app/report/risks
//
// Data from verdict object (from URL state or API)
```

**File:** `client/pages/app/RisksScreen.tsx` (Route: /app/report/risks)

```typescript
// Screen 4: "What could go wrong?"
//
// Elements:
// - Title
// - Max 3 risk cards:
//   - Title
//   - Plain explanation
//   - User symptom (what they'll notice)
// - Reassurance: "None of these are urgent right now"
// - Button: "Am I in the right place?" → /app/report/platform
//
// Data from verdict.risks[]
```

**File:** `client/pages/app/PlatformFit.tsx` (Route: /app/report/platform)

```typescript
// Screen 5: "Is this the right setup for you right now?"
//
// Elements:
// - Recommendation card:
//   - ✅ Recommended: [Platform name]
//   - Why bullets (max 2)
//   - When it changes
// - Button: "What should I do next?" → /app/report/next
//
// Data from verdict.platform_recommendation
```

**File:** `client/pages/app/NextStep.tsx` (Route: /app/report/next)

```typescript
// Screen 6: "What should you do next?"
//
// Elements:
// - One of three cards:
//   - Mode "do_nothing": Nothing right now
//   - Mode "watch_one_thing": Keep an eye on X
//   - Mode "small_upgrade": Before charging, do X
// - Button: "We can watch this for you" → /upgrade
// - Secondary: "Maybe later" → /app/watch
//
// Data from verdict.next_best_step
```

### Upgrade & Subscription

**File:** `client/pages/app/Upgrade.tsx` (Route: /upgrade)

```typescript
// Subscription pitch screen
//
// Elements:
// - Title: "Want us to keep watching this app?"
// - Copy about peace of mind
// - 3 bullets (what they get)
// - Pricing cards (Watch Mode + Growth Guard)
// - Button: "Start Watch Mode" → Stripe checkout
// - Secondary: "Maybe later" → /app/watch
//
// Must:
// - Fetch pricing_plans from server
// - Redirect to Stripe checkout on click
// - Handle post-payment redirect (Stripe webhook)
```

### Watch Mode Dashboard

**File:** `client/pages/app/WatchDashboard.tsx` (Route: /app/watch)

```typescript
// Main dashboard for active users
//
// Elements:
// - Status: 🟢 All good right now
// - Last checked: "2 hours ago"
// - Collapsed sections:
//   - "What we're watching" (usage, cost, risk)
// - Button: "Run a re-check now" (calls POST /api/analyze/:analysisId/recheck)
// - For free users: "Enable Watch Mode" button
//
// Must:
// - Fetch watch_mode_subscription status
// - Show different UI for free vs paid
// - Support manual recheck
```

**File:** `client/pages/app/AlertsCenter.tsx` (Route: /app/alerts)

```typescript
// Alert history and explanations
//
// Elements:
// - Alert list (paginated)
// - Each alert:
//   - Icon by category
//   - Title + body
//   - "What changed" + "Next step"
//   - Date
// - Mark as read on click
//
// Must:
// - Fetch GET /api/alerts
// - Support filtering by analysis
```

---

## Phase 4: Advanced Features

These come after core FTUE is working.

### Stage 2: Growth Readiness

**File:** `client/pages/app/GrowthReadiness.tsx` (Route: /app/growth-readiness)

```typescript
// Unlocked when usage or cost alerts fire
//
// Content from spec 08:
// - "Your app is growing — let's get ahead of it"
// - What changed
// - What this means
// - Recommended next setup
// - What if you do nothing
// - CTA: "Show me the next upgrade"
```

**File:** `server/services/changeGenerator.ts`

```typescript
// Generates Phase 1, 2, 3 prepared changes
//
// Phase 1: "Make Changes Safer"
// - Adds health checks
// - Adds safe restart behavior
// - Returns prepared change record
//
// Phase 2: "Separate What Grows Fast"
// - Logical separation of concerns
// - Returns prepared change record
//
// Phase 3: "Early Warnings & Stability"
// - Change verification
// - Rollback capability
// - Returns prepared change record
```

### Stage 3: Production Maturity

**File:** `client/pages/app/ProductionMaturity.tsx` (Route: /app/production)

```typescript
// Unlocked when sustained growth detected
//
// Content from spec 08:
// - "This is now a real product"
// - What you've outgrown
// - What production-ready means
// - Production blueprint (visual)
// - Options: Stay vs Upgrade
```

### Vibe Code Spec Generator

**File:** `server/services/vibeSpecGenerator.ts`

```typescript
// Generates build specs for vibe coding tools
//
// Input: appAnalysis, stage
// Output: VibeCodeSpec with:
// - appContext
// - primaryGoals
// - nonGoals
// - environmentAssumptions
// - operationalExpectations
// - growthAwareness
// - codingInstructions
//
// Specs are stage-specific:
// - MVP: "Keep it simple, avoid premature optimization"
// - Growth: "Design for scaling, but not over-engineering"
// - Production: "Expect zero-downtime deployments, prepare for growth"
```

**File:** `client/pages/app/VibeSpec.tsx` (Route: /app/spec)

```typescript
// Display + copy vibe code spec
//
// Elements:
// - Spec sections (expandable)
// - Copy buttons for different tools (Cursor, Replit, Claude)
// - "Why this matters" tooltips
```

---

## Type Contracts

All types are in `shared/types.ts`. Use these exactly.

### Database Models

```typescript
User {
  id: string (UUID)
  email: string
  name: string
  created_at: string (ISO timestamp)
  updated_at: string
}

AppAnalysis {
  id: string (UUID)
  user_id: string
  github_url?: string
  uploaded_file_name?: string
  status: 'pending' | 'completed' | 'failed'
  stack_detection: StackProfile (JSONB)
  behavior_profile: BehaviorProfile (JSONB)
  launch_confidence_score: number (0-100)
  created_at: string
  updated_at: string
}

Alert {
  id: string
  user_id: string
  analysis_id: string
  category: 'usage_growth' | 'cost_risk' | 'architecture_drift' | 'platform_suitability' | 'stability_regression'
  severity: 'informational' | 'heads_up' | 'action_soon'
  title: string
  body: string
  what_changed?: string
  next_step?: string
  created_at: string
  read_at?: string
}

WatchModeSubscription {
  id: string
  user_id: string
  analysis_id: string
  status: 'active' | 'paused' | 'canceled'
  plan: 'watch_mode' | 'growth_guard' | 'production_plus'
  last_check_at?: string
  confidence_score_at_last_check?: number
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}
```

### Response Contracts

```typescript
// POST /api/analyze
{
  analysisId: string,
  status: 'pending' | 'completed' | 'failed',
  verdict: LaunchVerdict // when completed
}

// GET /api/analyze/:analysisId
{
  analysis: AppAnalysis,
  verdict: LaunchVerdict,
  risks: RiskScenario[],
  platformRecommendation: PlatformRecommendation,
  nextBestStep: NextBestStepRecommendation
}

// LaunchVerdict
{
  analysis_id: string,
  status: 'safe' | 'watch' | 'fix',
  confidence_score: number (0-100),
  one_line_summary: string,
  risks: RiskScenario[] (max 3),
  platform_recommendation: PlatformRecommendation,
  next_best_step: NextBestStepRecommendation
}
```

---

## API Contracts

### Authentication

Every /app/\* endpoint requires:

```
Authorization: Bearer {sessionToken}
```

Middleware to implement:

```typescript
// server/middleware/auth.ts
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const session = await getOne(
    "SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()",
    [token],
  );
  if (!session) return res.status(401).json({ error: "Session expired" });

  req.userId = session.user_id;
  next();
}
```

### Error Responses

All errors use standard format:

```typescript
{
  error: string,
  code?: string,
  details?: unknown
}

Status codes:
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error
```

---

## Implementation Order

### Week 1: Foundation

1. Database setup (schema + seed data)
2. Database client (`server/db/client.ts`)
3. Auth routes (signup, login, session)
4. App Understanding service (stack detection, pattern analysis)

### Week 2: Core Logic

1. Judgment Engine service (confidence, risks, platform, next step)
2. Alert Orchestrator service
3. Analyze API route (POST /api/analyze)
4. Get Analysis API route (GET /api/analyze/:analysisId)

### Week 3: Frontend FTUE

1. AppShell + ProgressIndicator components
2. Connect screen
3. Analyzing screen
4. LaunchVerdict screen
5. Risks, Platform, NextStep screens

### Week 4: Subscription & Dashboard

1. Upgrade screen + Stripe integration
2. Watch Mode dashboard
3. Alerts center
4. Recheck analysis endpoint

### Week 5+: Advanced

1. Change Generator service
2. Growth Readiness screens
3. Production Maturity screens
4. Vibe Code Spec Generator

---

## Key Files Reference

```
server/
├── db/
│   ├── schema.sql          (run once to create tables)
│   └── client.ts           (database connection pool)
├── middleware/
│   └── auth.ts             (requireAuth middleware)
├── services/
│   ├── appUnderstanding.ts (stack + pattern analysis)
│   ├── judgmentEngine.ts   (confidence + risks + recommendations)
│   ├── alertOrchestrator.ts (alert logic)
│   └── changeGenerator.ts  (Phase 1-3 changes)
├── routes/
│   ├── auth.ts             (signup, login)
│   ├── analyze.ts          (analysis endpoints)
│   ├── alerts.ts           (alert endpoints)
│   └── stripe.ts           (Stripe webhooks)
└── index.ts                (register all routes)

client/
├── components/app/
│   ├── AppShell.tsx
│   ├── ProgressIndicator.tsx
│   └── (other app components)
└── pages/app/
    ├── Connect.tsx
    ├── Analyzing.tsx
    ├── LaunchVerdict.tsx
    ├── RisksScreen.tsx
    ├── PlatformFit.tsx
    ├── NextStep.tsx
    ├── Upgrade.tsx
    ├── WatchDashboard.tsx
    └── AlertsCenter.tsx

shared/
└── types.ts                (all type definitions - single source of truth)
```

---

## Environment Variables

Add to `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/devopsify
STRIPE_SECRET_KEY=sk_test_XXXX
STRIPE_PUBLISHABLE_KEY=pk_test_XXXX
GITHUB_TOKEN=ghp_XXXX (for repo cloning)
```

---

## Testing Your Work

After each phase:

```bash
# Start dev server
npm run dev

# Test endpoints
curl -X POST http://localhost:5173/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url":"https://github.com/user/repo"}'

# Check database
psql devopsify -c "SELECT * FROM app_analyses;"
```

---

## Notes for Claude Code

1. **Prioritize plain English**: Every output users see should avoid DevOps jargon
2. **Keep it simple**: Services should be ~200-300 lines, not monsters
3. **Type safety**: Use TypeScript strictly, no `any` types
4. **Error handling**: Every function should handle errors gracefully
5. **Database efficiency**: Index queries properly, avoid N+1 queries
6. **Git commits**: Make small, logical commits (one feature per commit)

---

End of handoff. Start with Phase 1. Good luck!
