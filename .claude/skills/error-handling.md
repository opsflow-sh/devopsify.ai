# Claude Code Skill: Error Handling & Resilience

## Overview

Graceful failures with helpful error messages. Never expose implementation details to users.

## Core Pattern

**Every async function should follow this pattern:**

```typescript
export async function handleSomething(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // 1. Validate input
    const validation = someSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.errors,
      });
    }

    // 2. Check authorization
    const userId = (req as any).userId;
    const resource = await getOne(
      "SELECT user_id FROM resources WHERE id = $1",
      [resourceId],
    );
    if (resource?.user_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 3. Execute business logic
    const result = await someBusinessLogic(validation.data);

    // 4. Return success
    res.json({ success: true, data: result });
  } catch (error) {
    // 5. Handle errors gracefully
    console.error("Failed in handleSomething:", error);

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: "Not found" });
    }

    // Generic fallback
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
```

## Error Response Format

**Consistent structure for all errors:**

```typescript
// 400: Validation errors
{
  "error": "Invalid input",
  "details": [
    { "path": ["email"], "message": "Invalid email format" }
  ]
}

// 401: Unauthorized
{
  "error": "Invalid credentials"
}

// 403: Forbidden
{
  "error": "Forbidden"
}

// 404: Not found
{
  "error": "Resource not found"
}

// 409: Conflict (duplicate)
{
  "error": "Email already registered"
}

// 500: Server error
{
  "error": "Something went wrong. Please try again."
}
```

## By Error Type

### Validation Errors (400)

```typescript
// User input validation failed
const parsed = signupSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({
    error: "Invalid input",
    details: parsed.error.flatten(),
  });
}

// Missing required fields
if (!req.body.email) {
  return res.status(400).json({ error: "Email is required" });
}
```

### Authentication Errors (401)

```typescript
// Invalid session
const session = await getOne("SELECT * FROM sessions WHERE id = $1", [token]);
if (!session || session.expires_at < new Date()) {
  return res.status(401).json({ error: "Invalid or expired session" });
}

// Wrong password
const match = await bcrypt.compare(password, user.password_hash);
if (!match) {
  return res.status(401).json({ error: "Invalid credentials" });
}

// No auth header
const token = req.headers.authorization?.split(" ")[1];
if (!token) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

### Authorization Errors (403)

```typescript
// User doesn't own resource
const analysis = await getOne(
  "SELECT user_id FROM app_analyses WHERE id = $1",
  [id],
);
if (analysis?.user_id !== userId) {
  // Don't reveal why
  return res.status(403).json({ error: "Forbidden" });
}

// Insufficient permissions
if (user.plan !== "production_plus") {
  return res
    .status(403)
    .json({ error: "This feature requires Production+ plan" });
}
```

### Not Found Errors (404)

```typescript
const user = await getOne("SELECT * FROM users WHERE id = $1", [userId]);
if (!user) {
  return res.status(404).json({ error: "User not found" });
}
```

### Conflict Errors (409)

```typescript
// Duplicate email during signup
try {
  await createUser(email, password, name);
} catch (error) {
  if (error instanceof Error && error.message.includes("unique constraint")) {
    return res.status(409).json({ error: "Email already registered" });
  }
  throw error;
}
```

### Server Errors (500)

```typescript
// Unexpected error - log and return generic message
try {
  // ... operation
} catch (error) {
  console.error("Database operation failed:", {
    operation: "updateUser",
    userId,
    error: error instanceof Error ? error.message : String(error),
  });

  res.status(500).json({ error: "Something went wrong. Please try again." });
}
```

## Logging Best Practices

**Always log with context:**

```typescript
// ✅ GOOD - Context and info
console.error("Failed to create user", {
  email,
  reason: error instanceof Error ? error.message : String(error),
  timestamp: new Date().toISOString(),
});

// ❌ BAD - No context
console.error(error);

// ❌ BAD - Exposes secrets
console.error("Auth failed", { user, password, token });
```

**Never expose secrets in logs:**

```typescript
// ❌ WRONG
console.log("Stripe key:", stripeKey);
console.log("Auth:", { email, password });

// ✅ CORRECT
console.log("Stripe initialized");
console.log("Auth attempt for:", email); // No password
```

## Database Error Handling

```typescript
export async function handleCreateUser(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(email, hashedPassword, name);

    res.json({ user });
  } catch (error) {
    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        // Duplicate email
        return res.status(409).json({ error: "Email already registered" });
      }

      if (error.message.includes("connection refused")) {
        // Database down
        console.error("Database connection failed:", error);
        return res
          .status(503)
          .json({ error: "Service temporarily unavailable" });
      }
    }

    // Generic error
    console.error("Failed to create user:", error);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
}
```

## API Call Error Handling

```typescript
// GitHub API error
try {
  const repo = await octokit.repos.get({
    owner: "user",
    repo: "name",
  });
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes("404")) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (error.message.includes("rate limit")) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
  }

  console.error("GitHub API error:", error);
  res.status(500).json({ error: "Failed to fetch repository" });
}

// Stripe error
try {
  const session = await stripe.checkout.sessions.create({...});
} catch (error) {
  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return res.status(400).json({ error: error.message });
  }

  console.error("Stripe error:", error);
  res.status(500).json({ error: "Payment processing failed" });
}
```

## Frontend Error Handling

**Show errors to users, but be helpful:**

```typescript
import { useQuery } from "@tanstack/react-query";

export function WatchDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analysis"],
    queryFn: () => fetch("/api/analyze/123").then(r => r.json()),
  });

  if (isLoading) {
    return <div>Loading your analysis...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load analysis</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Please try refreshing the page."}
        </AlertDescription>
      </Alert>
    );
  }

  return <div>{/* display data */}</div>;
}
```

## Resilience Patterns

### Retry with Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError!;
}

// Usage
const analysis = await retryWithBackoff(() => cloneGitHubRepo(repoUrl));
```

### Timeout Protection

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs),
    ),
  ]);
}

// Usage
const analysis = await withTimeout(
  analyzeApp(repoUrl),
  30000, // 30 seconds
);
```

## Checklist Before Commit

- [ ] All catch blocks handle errors gracefully
- [ ] User-facing errors are helpful, not revealing
- [ ] Database errors don't expose schema/details
- [ ] API errors from third parties handled
- [ ] No unhandled promise rejections
- [ ] Errors logged with context
- [ ] No credentials logged
- [ ] Error responses use consistent format
- [ ] 500 errors return generic message
- [ ] All error paths tested
