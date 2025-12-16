# Claude Code Skill: Backend Type Safety & Database Access

## Overview

Enforce strict TypeScript usage and safe database patterns throughout the backend. This prevents runtime errors, SQL injection, and makes refactoring safe.

## Core Rules

### 1. No `any` Types - EVER

Every function parameter and return type must be explicitly declared.

**❌ WRONG:**

```typescript
export async function fetchUser(userId: any): Promise<any> {
  return await getOne("SELECT * FROM users WHERE id = $1", [userId]);
}
```

**✅ CORRECT:**

```typescript
import type { User } from "@shared/types";

export async function fetchUser(userId: string): Promise<User | null> {
  return await getOne<User>("SELECT * FROM users WHERE id = $1", [userId]);
}
```

### 2. Parameterized Queries ALWAYS

**Why:** Prevents SQL injection attacks.

**❌ WRONG:**

```typescript
// VULNERABLE TO SQL INJECTION
const result = await query(`SELECT * FROM users WHERE email = '${email}'`);
```

**✅ CORRECT:**

```typescript
// SAFE - uses parameter placeholders
const result = await query("SELECT * FROM users WHERE email = $1", [email]);
```

**Pattern for Multiple Parameters:**

```typescript
const alert = await getOne<Alert>(
  "SELECT * FROM alerts WHERE user_id = $1 AND id = $2 AND created_at > $3",
  [userId, alertId, oneWeekAgo],
);
```

### 3. Import Types from `@shared/types.ts`

All domain types come from shared types file - this is the single source of truth.

**❌ WRONG:**

```typescript
export interface User {
  id: string;
  email: string;
}

export async function getUser(id: string): Promise<User> {
  // ...
}
```

**✅ CORRECT:**

```typescript
import type { User } from "@shared/types";

export async function getUser(id: string): Promise<User | null> {
  return await getOne<User>("SELECT * FROM users WHERE id = $1", [id]);
}
```

### 4. Use Database Helpers from `server/db/client.ts`

Three main helpers:

#### `getOne<T>(sql, params): Promise<T | null>`

Fetch a single record.

```typescript
const user = await getOne<User>("SELECT * FROM users WHERE id = $1", [userId]);
// Returns User or null
```

#### `getMany<T>(sql, params): Promise<T[]>`

Fetch multiple records.

```typescript
const alerts = await getMany<Alert>(
  "SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
  [userId, 20],
);
// Returns Alert[]
```

#### `query(sql, params): Promise<QueryResult>`

Raw query for inserts, updates, deletes.

```typescript
const result = await query(
  "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *",
  [email, hashedPassword, name],
);
const user = result.rows[0] as User;
```

## Common Patterns

### Creating a Record

```typescript
export async function createUser(
  email: string,
  hashedPassword: string,
  name: string,
): Promise<User> {
  const result = await query(
    "INSERT INTO users (email, password_hash, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
    [email, hashedPassword, name],
  );

  if (result.rows.length === 0) {
    throw new Error("Failed to create user");
  }

  return result.rows[0] as User;
}
```

### Updating a Record

```typescript
export async function updateUser(
  userId: string,
  updates: Partial<User>,
): Promise<User | null> {
  const result = await query(
    "UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [updates.name, userId],
  );

  return result.rows[0] || null;
}
```

### Deleting a Record

```typescript
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await query("DELETE FROM users WHERE id = $1", [userId]);

  return result.rowCount > 0;
}
```

## Type Contracts for Route Handlers

All route handlers must have typed req/res:

```typescript
import type { Request, Response } from "express";
import type { User } from "@shared/types";

export async function handleGetUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = (req as any).userId; // From auth middleware

    const user = await getOne<User>(
      "SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1",
      [userId],
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

## Type Assertion Rules

Minimize type assertions. Use them ONLY when:

1. You're absolutely certain about the type
2. TypeScript can't infer it correctly
3. Comment explaining WHY

**❌ WRONG:**

```typescript
// Too many assertions
const user = (await getOne("SELECT * FROM users WHERE id = $1", [id])) as User;
const email = user.email as string;
```

**✅ CORRECT:**

```typescript
const user = await getOne<User>("SELECT * FROM users WHERE id = $1", [id]);
// user is already User | null, no assertion needed
if (user) {
  const email = user.email; // Already typed as string
}
```

## Null/Undefined Handling

Always handle null cases explicitly.

**❌ WRONG:**

```typescript
const user = await getOne<User>("SELECT * FROM users WHERE id = $1", [userId]);
res.json(user); // What if null?
```

**✅ CORRECT:**

```typescript
const user = await getOne<User>("SELECT * FROM users WHERE id = $1", [userId]);

if (!user) {
  res.status(404).json({ error: "User not found" });
  return;
}

res.json({ user });
```

## Generic Type Patterns

Use TypeScript generics properly:

```typescript
// Good: Generic database fetch
async function fetchById<T>(table: string, id: string): Promise<T | null> {
  return await getOne<T>(`SELECT * FROM ${table} WHERE id = $1`, [id]);
}

// Then use with specific types
const user = await fetchById<User>("users", userId);
const analysis = await fetchById<AppAnalysis>("app_analyses", analysisId);
```

## When to Create New Types

If you need a response type not in `@shared/types.ts`:

1. Add it to `@shared/types.ts` if it's a domain object
2. Create it locally in the service file if it's internal only

```typescript
// ✅ Domain type - goes in shared/types.ts
export interface LaunchVerdict {
  analysis_id: string;
  status: "safe" | "watch" | "fix";
  // ...
}

// ✅ Internal type - can stay in service file
type ConfidenceFactors = {
  statefulness: number;
  dataHandling: number;
  dependencies: number;
};
```

## Checklist Before Commit

- [ ] No `any` types in function signatures
- [ ] All database queries parameterized
- [ ] All returned types explicitly declared
- [ ] Database helpers used (getOne, getMany, query)
- [ ] Null cases handled explicitly
- [ ] Error messages typed correctly
- [ ] Imports from `@shared/types` for domain objects
