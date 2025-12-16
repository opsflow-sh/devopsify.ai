# Claude Code Skill: Database Patterns & Efficiency

## Overview
Efficient, safe, well-indexed database operations using PostgreSQL and parameterized queries.

## Connection & Pooling

**Setup in `server/db/client.ts`:**

```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
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
  params?: unknown[]
): Promise<T | null> {
  const result = await query(text, params);
  return result.rows[0] || null;
}

export async function getMany<T>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await query(text, params);
  return result.rows;
}
```

## Parameterized Query Patterns

**ALL database operations MUST use parameterized queries ($1, $2, etc).**

### Simple SELECT

```typescript
// Get by ID
const user = await getOne<User>(
  "SELECT * FROM users WHERE id = $1",
  [userId]
);

// Get by email
const user = await getOne<User>(
  "SELECT * FROM users WHERE email = $1",
  [email]
);

// Get with multiple conditions
const alert = await getOne<Alert>(
  "SELECT * FROM alerts WHERE user_id = $1 AND id = $2 AND created_at > $3",
  [userId, alertId, oneWeekAgo]
);
```

### SELECT Multiple

```typescript
// Get all with ordering
const analyses = await getMany<AppAnalysis>(
  "SELECT * FROM app_analyses WHERE user_id = $1 ORDER BY created_at DESC",
  [userId]
);

// Get with pagination
const alerts = await getMany<Alert>(
  "SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
  [userId, 20, 0]
);

// Get with WHERE IN
const analyses = await getMany<AppAnalysis>(
  "SELECT * FROM app_analyses WHERE user_id = $1 AND id = ANY($2)",
  [userId, ["id1", "id2", "id3"]]
);
```

### INSERT

```typescript
// Single insert
const result = await query(
  "INSERT INTO users (email, password_hash, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
  [email, hashedPassword, name]
);
const user = result.rows[0] as User;

// Bulk insert
const result = await query(
  "INSERT INTO alerts (user_id, analysis_id, category, title) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8) RETURNING *",
  [userId1, analysisId1, "usage", "title1", userId2, analysisId2, "cost", "title2"]
);
```

### UPDATE

```typescript
// Update single field
const result = await query(
  "UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
  [newName, userId]
);

// Update multiple fields
const result = await query(
  "UPDATE app_analyses SET status = $1, launch_confidence_score = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
  ["completed", 75, analysisId]
);

// UPDATE from SELECT
const result = await query(
  "UPDATE watch_mode_subscriptions SET last_check_at = NOW(), confidence_score_at_last_check = $1 WHERE analysis_id = $2 RETURNING *",
  [newScore, analysisId]
);
```

### DELETE

```typescript
// Delete single record
const result = await query(
  "DELETE FROM sessions WHERE id = $1 RETURNING *",
  [sessionToken]
);

// Delete with condition
await query(
  "DELETE FROM sessions WHERE expires_at < NOW()"
);
```

## Indexing

**Create indexes for:**
- Primary keys (automatic)
- Foreign keys
- Frequently-searched columns
- Sorting columns
- Filtering columns

**Good indexes from schema:**
```sql
CREATE INDEX idx_app_analyses_user_id ON app_analyses(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_analysis_id ON alerts(analysis_id);
CREATE INDEX idx_alerts_read_at ON alerts(read_at);
CREATE INDEX idx_watch_subscriptions_user_id ON watch_mode_subscriptions(user_id);
```

**Bad/Unnecessary indexes:**
```sql
-- Don't index rarely-searched columns
CREATE INDEX idx_users_created_at ON users(created_at); -- Usually not searched

-- Don't index already-indexed foreign keys
CREATE INDEX idx_alerts_user_id2 ON alerts(user_id); -- Redundant if already exists
```

## Avoiding N+1 Queries

**❌ BAD - Causes N+1 queries:**
```typescript
const analyses = await getMany<AppAnalysis>(
  "SELECT * FROM app_analyses WHERE user_id = $1",
  [userId]
);

// This causes N additional queries (one per analysis)
for (const analysis of analyses) {
  const risks = await getMany<RiskScenario>(
    "SELECT * FROM risks WHERE analysis_id = $1",
    [analysis.id]
  );
  analysis.risks = risks;
}
```

**✅ GOOD - Single query:**
```typescript
// Get all alerts for analyses in one query
const alerts = await getMany<Alert>(
  `SELECT alerts.* 
   FROM alerts
   WHERE alerts.analysis_id IN (
     SELECT id FROM app_analyses WHERE user_id = $1
   )
   ORDER BY alerts.created_at DESC`,
  [userId]
);

// Or use JOIN if structure allows
const alertsWithAnalysis = await getMany(
  `SELECT a.*, aa.id as analysis_id
   FROM alerts a
   JOIN app_analyses aa ON a.analysis_id = aa.id
   WHERE aa.user_id = $1`,
  [userId]
);
```

## Transactions

**Use transactions for multi-step operations:**

```typescript
export async function createUserWithSession(
  email: string,
  passwordHash: string,
  name: string
): Promise<{ user: User; sessionToken: string }> {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    // Step 1: Create user
    const userResult = await client.query(
      "INSERT INTO users (email, password_hash, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
      [email, passwordHash, name]
    );
    const user = userResult.rows[0] as User;

    // Step 2: Create session
    const sessionToken = crypto.randomBytes(20).toString("hex");
    await client.query(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [sessionToken, user.id]
    );

    await client.query("COMMIT");

    return { user, sessionToken };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

## JSON/JSONB Fields

**For storing nested data (like analysis profiles):**

```typescript
// Store as JSONB
const result = await query(
  "INSERT INTO app_analyses (user_id, stack_detection, behavior_profile) VALUES ($1, $2, $3) RETURNING *",
  [userId, JSON.stringify(stackProfile), JSON.stringify(behaviorProfile)]
);

// Query JSONB field
const analyses = await getMany(
  "SELECT * FROM app_analyses WHERE stack_detection->>'runtime' = $1",
  ["node"]
);

// Update JSONB field
await query(
  "UPDATE app_analyses SET stack_detection = $1 WHERE id = $2",
  [JSON.stringify(updatedStack), analysisId]
);
```

## Common Queries

### Count Records
```typescript
const result = await query(
  "SELECT COUNT(*) as count FROM alerts WHERE user_id = $1",
  [userId]
);
const count = parseInt(result.rows[0].count);
```

### Check Exists
```typescript
const result = await query(
  "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)",
  [email]
);
const exists = result.rows[0].exists;
```

### Aggregate
```typescript
const result = await query(
  "SELECT COUNT(*) as count, AVG(CAST(launch_confidence_score AS NUMERIC)) as avg_score FROM app_analyses WHERE user_id = $1",
  [userId]
);
```

### Get Latest
```typescript
const analysis = await getOne<AppAnalysis>(
  "SELECT * FROM app_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
  [userId]
);
```

## Performance Tips

### Use LIMIT for Large Result Sets
```typescript
// Bad: Fetch 10,000 rows
const allAlerts = await getMany("SELECT * FROM alerts WHERE user_id = $1", [userId]);

// Good: Paginate
const alerts = await getMany(
  "SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20 OFFSET 0",
  [userId]
);
```

### Only SELECT Needed Columns
```typescript
// Bad: Get all columns
const user = await getOne("SELECT * FROM users WHERE id = $1", [userId]);

// Good: Only needed columns
const user = await getOne(
  "SELECT id, email, name FROM users WHERE id = $1",
  [userId]
);
```

### Use Indexes for Sorting
```typescript
// Ensure ORDER BY column is indexed
const alerts = await getMany(
  "SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
  [userId]
);
// created_at should be indexed
```

## Monitoring & Debugging

**Check slow queries:**
```sql
-- Enable query logging
SET log_min_duration_statement = 1000; -- Log queries > 1 second

-- View indexes
SELECT * FROM pg_indexes WHERE tablename = 'alerts';

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('alerts'));
```

## Checklist Before Commit

- [ ] All queries parameterized ($1, $2, etc)
- [ ] No string concatenation in SQL
- [ ] Foreign key columns indexed
- [ ] Frequently-queried columns indexed
- [ ] No N+1 query patterns
- [ ] Large result sets paginated
- [ ] Multi-step operations use transactions
- [ ] JSON data stored as JSONB
- [ ] Only SELECT needed columns
- [ ] Error handling for DB failures

