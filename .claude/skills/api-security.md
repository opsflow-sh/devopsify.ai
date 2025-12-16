# Claude Code Skill: API Security & Input Validation

## Overview

Prevent common vulnerabilities: SQL injection, CSRF, invalid input, auth bypass, credential leaks.

## Core Rules

### 1. Validate ALL User Input with Zod

Never trust user input. Every endpoint must validate.

**❌ WRONG:**

```typescript
export async function handleSignup(req: Request, res: Response) {
  const { email, password, name } = req.body;

  // No validation - vulnerable!
  await createUser(email, password, name);
  res.json({ success: true });
}
```

**✅ CORRECT:**

```typescript
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function handleSignup(req: Request, res: Response) {
  const validation = signupSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: validation.error.errors,
    });
  }

  const { email, password, name } = validation.data;
  await createUser(email, password, name);
  res.json({ success: true });
}
```

### 2. Zod Schema Patterns

**Basic Schemas:**

```typescript
// Email validation
const emailSchema = z.string().email("Invalid email");

// Password validation (at least 8 chars, mix of numbers/letters)
const passwordSchema = z
  .string()
  .min(8)
  .regex(/[a-z]/i, "Must contain letters")
  .regex(/[0-9]/, "Must contain numbers");

// UUID validation
const uuidSchema = z.string().uuid("Invalid ID format");

// Enum validation
const planSchema = z.enum(["watch_mode", "growth_guard", "production_plus"]);
```

**Complex Schemas:**

```typescript
const analyzeSchema = z
  .object({
    github_url: z.string().url("Invalid GitHub URL").optional(),
    uploaded_file: z
      .object({
        buffer: z.instanceof(Buffer),
        originalname: z.string(),
      })
      .optional(),
  })
  .refine(
    (data) => data.github_url || data.uploaded_file,
    "Must provide either github_url or uploaded_file",
  );
```

**Query Parameter Validation:**

```typescript
const alertsQuerySchema = z.object({
  analysisId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function handleGetAlerts(req: Request, res: Response) {
  const validation = alertsQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  const { analysisId, limit, offset } = validation.data;
  // ... fetch alerts
}
```

### 3. SQL Injection Prevention

**ALWAYS parameterize queries. NO EXCEPTIONS.**

**❌ NEVER DO THIS:**

```typescript
// VULNERABLE - String concatenation
const email = "test'; DROP TABLE users; --";
const query = `SELECT * FROM users WHERE email = '${email}'`;
// SQL becomes: SELECT * FROM users WHERE email = 'test'; DROP TABLE users; --'
```

**✅ ALWAYS DO THIS:**

```typescript
// SAFE - Parameterized
const email = "test'; DROP TABLE users; --";
const user = await getOne<User>("SELECT * FROM users WHERE email = $1", [
  email,
]);
// Email is treated as literal string, not SQL
```

### 4. Authentication & Authorization

**Auth Middleware Pattern:**

```typescript
// Apply to ALL protected routes
import { requireAuth } from "@/server/middleware/auth";

app.get("/api/alerts", requireAuth, handleGetAlerts);
app.post("/api/analyze/:id/recheck", requireAuth, handleRecheckAnalysis);
```

**Authorization Check Pattern:**

```typescript
export async function handleUpdateAnalysis(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = (req as any).userId; // From auth middleware
  const { analysisId } = req.params;

  // Verify user owns this analysis
  const analysis = await getOne<AppAnalysis>(
    "SELECT user_id FROM app_analyses WHERE id = $1",
    [analysisId],
  );

  if (!analysis) {
    return res.status(404).json({ error: "Analysis not found" });
  }

  if (analysis.user_id !== userId) {
    // Don't reveal why it failed (security)
    return res.status(403).json({ error: "Forbidden" });
  }

  // Safe to proceed
}
```

### 5. Stripe Webhook Security

**ALWAYS verify webhook signatures:**

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  const sig = req.headers["stripe-signature"] as string;

  try {
    // MUST use raw body (not JSON-parsed)
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Process event
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    res.status(400).json({ error: "Invalid signature" });
  }
}
```

**Important:** Express setup must handle raw body for webhook:

```typescript
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);
```

### 6. Error Message Safety

**❌ WRONG - Exposes implementation details:**

```typescript
try {
  await createUser(email, password, name);
  res.json({ success: true });
} catch (error: any) {
  // LEAKS DATABASE DETAILS
  res.status(500).json({ error: error.message });
}
```

**✅ CORRECT - Generic, user-friendly messages:**

```typescript
try {
  await createUser(email, password, name);
  res.json({ success: true });
} catch (error) {
  console.error("Signup failed:", error); // Log for debugging

  if (error instanceof Error && error.message.includes("unique constraint")) {
    // Email already exists
    return res.status(409).json({ error: "Email already registered" });
  }

  // Generic fallback
  res.status(500).json({ error: "Signup failed. Please try again." });
}
```

### 7. Session Management

**Session Creation Pattern:**

```typescript
// Generate 40-character random token
const sessionToken = crypto.randomBytes(20).toString("hex");

const result = await query(
  "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days') RETURNING *",
  [sessionToken, userId],
);

res.json({ sessionToken });
```

**Session Verification Pattern:**

```typescript
const session = await getOne(
  "SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()",
  [sessionToken],
);

if (!session) {
  return res.status(401).json({ error: "Invalid or expired session" });
}

// Session is valid
const userId = session.user_id;
```

### 8. Environment Variables

**Never expose secrets in code. NEVER.**

**❌ WRONG:**

```typescript
const stripeKey = "sk_live_4eC39HqLyjWDarhtXXXXXXXX"; // LEAKED!
```

**✅ CORRECT:**

```typescript
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error("STRIPE_SECRET_KEY not configured");
}
```

**List of Secrets:**

- `DATABASE_URL` - Connection string
- `STRIPE_SECRET_KEY` - Stripe secret
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `GITHUB_TOKEN` - GitHub API token
- `SESSION_SECRET` - For session signing (if needed)

All must be in `.env` file (gitignored).

### 9. Rate Limiting Placeholder

For future implementation (not Week 1):

```typescript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
});

app.post("/api/auth/login", loginLimiter, handleLogin);
```

### 10. CORS Configuration

**Default setup (already in server/index.ts):**

```typescript
app.use(cors());
```

**Restrict if needed (production):**

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

## Security Checklist Before Commit

- [ ] All user inputs validated with Zod
- [ ] All SQL queries parameterized ($1, $2, etc)
- [ ] No string concatenation in SQL
- [ ] Auth middleware applied to protected routes
- [ ] Authorization checks verify user ownership
- [ ] Error messages don't expose implementation
- [ ] Stripe webhooks verify signature
- [ ] No hardcoded credentials
- [ ] Session tokens are random 40+ char
- [ ] `.env` is in `.gitignore`

## Common Vulnerability Patterns to Avoid

| Vulnerability      | Pattern                                         | Fix                                    |
| ------------------ | ----------------------------------------------- | -------------------------------------- |
| SQL Injection      | `"SELECT * FROM users WHERE id = '" + id + "'"` | Use parameterized: `$1`                |
| Missing Validation | `const email = req.body.email`                  | Use Zod validation                     |
| Auth Bypass        | No middleware on protected routes               | Apply `requireAuth`                    |
| Credential Leak    | `const apiKey = "sk_..."` in code               | Use environment variables              |
| CSRF               | No token verification                           | Use stateless sessions (we do)         |
| Info Disclosure    | `catch (e) { res.json(e) }`                     | Log internally, return generic message |
