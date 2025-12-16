# DevOpsify.ai - Quick Start for Claude Code

## What You're Building

A SaaS platform that analyzes vibe-coded apps and helps founders safely grow from MVP → production, without requiring DevOps knowledge.

**Key Insight:** This is NOT a DevOps tool. It's a growth companion that encodes 20 years of DevOps experience into plain English guidance.

---

## Project Status

✅ **Done:**
- Marketing website (complete)
- Database schema (ready)
- Type definitions (ready)
- API route stubs (ready)
- Service stubs (ready)
- Environment setup (ready)

⏳ **Your Job:**
- Implement all the services and routes defined in `CLAUDE_HANDOFF.md`
- Build the frontend FTUE screens
- Wire everything together

---

## Start Here

1. **Read** `CLAUDE_HANDOFF.md` (the complete handoff document)
2. **Follow** the "Implementation Order" section (Week 1-5)
3. **Reference** the contracts and type definitions in `shared/types.ts`

---

## Database Setup (One Time)

```bash
# 1. Create database
createdb devopsify

# 2. Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run schema
psql devopsify < server/db/schema.sql

# 4. Seed reference data (run the INSERT statements from CLAUDE_HANDOFF.md)
# This inserts risk_scenarios, platform_recommendations, etc.
```

---

## Development Workflow

```bash
# Start dev server (auto-restarts on changes)
npm run dev

# Test endpoints
curl -X POST http://localhost:5173/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url":"https://github.com/user/repo"}'

# Check database
psql devopsify -c "SELECT * FROM app_analyses;"
```

---

## Key Files (Where You'll Spend Time)

```
server/
├── db/client.ts                    # Database connection (implement this first)
├── middleware/auth.ts              # Auth middleware (implement early)
├── services/
│   ├── appUnderstanding.ts         # Stack detection + pattern analysis
│   ├── judgmentEngine.ts           # Confidence + risks + recommendations
│   ├── alertOrchestrator.ts        # Alert logic
│   └── changeGenerator.ts          # Phase 1-3 changes (later)
└── routes/
    ├── auth.ts                     # Signup, login, logout
    ├── analyze.ts                  # Analysis endpoints
    ├── alerts.ts                   # Alert management
    └── stripe.ts                   # Payment integration

client/
└── pages/app/
    ├── Connect.tsx                 # Step 1: Upload repo
    ├── Analyzing.tsx               # Step 2: In progress
    ├── LaunchVerdict.tsx           # Step 3: "Safe to launch?"
    ├── RisksScreen.tsx             # Step 4: "What could go wrong?"
    ├── PlatformFit.tsx             # Step 5: "Right place?"
    ├── NextStep.tsx                # Step 6: "What to do next?"
    ├── Upgrade.tsx                 # Subscription pitch
    └── WatchDashboard.tsx          # Main dashboard
```

---

## Priority Order (What to Build First)

### Priority 1: Get Analysis Working
These are critical for the core value proposition:

1. `server/db/client.ts` - Database connection pool
2. `server/middleware/auth.ts` - Session verification
3. `server/routes/auth.ts` - Signup/login
4. `server/services/appUnderstanding.ts` - Stack detection (40% of magic)
5. `server/services/judgmentEngine.ts` - Scoring & recommendations (60% of magic)
6. `server/routes/analyze.ts` - Tie it all together

**Target:** By end of Week 1, you can upload a GitHub repo and get a verdict.

### Priority 2: Frontend FTUE
Build the screens users interact with:

1. `client/components/app/AppShell.tsx` - Layout wrapper
2. `client/pages/app/Connect.tsx` - Form
3. `client/pages/app/Analyzing.tsx` - Polling progress
4. `client/pages/app/LaunchVerdict.tsx` - THE AHA MOMENT
5. Risks, Platform, NextStep screens

**Target:** By end of Week 2, users see results.

### Priority 3: Subscription & Dashboard
Monetization and retention:

1. `server/routes/stripe.ts` - Stripe integration
2. `client/pages/app/Upgrade.tsx` - Subscription pitch
3. `client/pages/app/WatchDashboard.tsx` - Monitoring
4. `server/routes/alerts.ts` - Alert system

**Target:** By end of Week 3, you can charge users.

### Priority 4: Advanced (Nice to Have)
Only after core is solid:

1. Change Generator (Phase 1-3 automations)
2. Stage 2 & 3 unlock screens
3. Vibe Code Spec feature

---

## Code Principles

### Plain English Above All
Every user-facing output must be language a vibe coder understands.

❌ Bad: "Kubernetes orchestration limits approaching"
✅ Good: "If 100+ people use this at once, requests may slow down"

### Keep Services Small
Services should be ~200-300 lines, not 1000+ monsters.

❌ Bad: One 1000-line judgmentEngine service
✅ Good: Split into calculateConfidence(), detectRisks(), recommend*()

### Type Safety
Use TypeScript strictly. No `any` types.

```typescript
// Good
async function detectRisks(stack: StackProfile): Promise<Risk[]>

// Bad
async function detectRisks(stack: any): Promise<any>
```

### Database Efficiency
- Always index foreign keys and frequent queries
- Use parameterized queries to prevent SQL injection
- Avoid N+1 queries (fetch related data in one query)

### Error Handling
Every function should handle errors gracefully.

```typescript
try {
  // your code
} catch (error) {
  // Log the error
  console.error("Failed to analyze app:", error);
  
  // Return helpful error to user
  res.status(500).json({ error: "Analysis failed" });
}
```

---

## Common Patterns

### Fetching Data from Database
```typescript
import { getOne, getMany } from "@/server/db/client";

// Get single record
const user = await getOne<User>(
  "SELECT * FROM users WHERE id = $1",
  [userId]
);

// Get multiple records
const alerts = await getMany<Alert>(
  "SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
  [userId, limit]
);
```

### Creating Records
```typescript
import { query } from "@/server/db/client";

const result = await query(
  "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
  [email, hashedPassword, name]
);
const user = result.rows[0];
```

### API Response Pattern
```typescript
export async function handleSomething(req: Request, res: Response) {
  try {
    // Your logic
    const result = await someService();
    
    // Always return structured response
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // Log for debugging
    console.error("Error in handleSomething:", error);
    
    // Return user-friendly error
    res.status(500).json({
      error: "Something went wrong",
      code: "INTERNAL_ERROR"
    });
  }
}
```

---

## Testing Your Work

### Test Database Connection
```bash
node -e "
const { query } = require('./dist/server/db/client');
query('SELECT NOW()').then(r => console.log('Connected!'));
"
```

### Test Auth Signup
```bash
curl -X POST http://localhost:5173/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Test Analysis
```bash
curl -X POST http://localhost:5173/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url":"https://github.com/vercel/next.js"}'
```

---

## Dependencies Available

These are already in `package.json`. Use them:

- `pg` - PostgreSQL client
- `express` - Web framework
- `zod` - Validation
- `bcrypt` - Password hashing (for auth)
- `stripe` - Payment processing
- `react-hook-form` - Form management (frontend)
- `@tanstack/react-query` - Data fetching (frontend)
- `lucide-react` - Icons
- `framer-motion` - Animations

---

## When You Get Stuck

1. **Check CLAUDE_HANDOFF.md** - It has detailed contracts for every function
2. **Look at existing code** - The marketing site is complete, use it as reference
3. **Read spec documents** - `01 Product Spec.md` through `19 Builder.io page tree.md`
4. **Type safety first** - Let TypeScript guide you to the right structure

---

## Commits

Make small, logical commits as you go. Examples:

```
feat: implement database client with connection pooling
feat: add auth middleware and session verification
feat: implement app understanding engine (stack detection)
feat: add app analysis API endpoint
feat: build FTUE Connect screen
feat: add Launch Verdict screen with confidence scoring
```

---

## You've Got This!

You're building the intelligence layer that makes vibe-coded apps production-ready.

The difference between a failed startup and a successful one might just be DevOpsify telling them when to upgrade.

Questions? Re-read `CLAUDE_HANDOFF.md`. It has all the answers.

Good luck! 🚀
