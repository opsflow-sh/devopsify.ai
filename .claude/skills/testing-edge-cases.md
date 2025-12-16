# Claude Code Skill: Testing & Edge Cases

## Overview
Ensure code handles edge cases and can be tested. Use Vitest (already configured).

## Testing Structure

```
server/
├── routes/
│   ├── auth.ts
│   └── auth.spec.ts          ← Test file next to implementation
├── services/
│   ├── judgmentEngine.ts
│   └── judgmentEngine.spec.ts
└── ...
```

## Unit Test Pattern

**All services should have tests:**

```typescript
// server/services/judgmentEngine.spec.ts
import { describe, it, expect } from "vitest";
import { calculateLaunchConfidence } from "./judgmentEngine";
import type { StackProfile, BehaviorProfile } from "@shared/types";

describe("calculateLaunchConfidence", () => {
  it("returns high score for safe app", () => {
    const stack: StackProfile = { external_apis: [] };
    const behavior: BehaviorProfile = {
      is_stateful: false,
      write_heavy: false,
      has_background_jobs: false,
      has_file_uploads: false,
      estimated_concurrency_risk: "low",
      external_dependency_count: 0,
    };

    const { score } = calculateLaunchConfidence(stack, behavior);
    
    expect(score).toBeGreaterThan(80);
  });

  it("returns low score for risky app", () => {
    const stack: StackProfile = { external_apis: ["stripe", "sendgrid", "twilio"] };
    const behavior: BehaviorProfile = {
      is_stateful: true,
      write_heavy: true,
      has_background_jobs: true,
      has_file_uploads: true,
      estimated_concurrency_risk: "high",
      external_dependency_count: 5,
    };

    const { score } = calculateLaunchConfidence(stack, behavior);
    
    expect(score).toBeLessThan(50);
  });

  it("is deterministic", () => {
    const stack = { external_apis: [] } as StackProfile;
    const behavior = { is_stateful: true } as BehaviorProfile;

    const result1 = calculateLaunchConfidence(stack, behavior);
    const result2 = calculateLaunchConfidence(stack, behavior);

    expect(result1).toEqual(result2);
  });
});
```

## Edge Cases by Component

### `detectStack()` Edge Cases

**Test for:**
```typescript
describe("detectStack", () => {
  it("handles missing package.json", async () => {
    const content = { files: new Map() };
    const result = await detectStack(content);
    
    expect(result.runtime).toBeUndefined();
    expect(result.external_apis).toEqual([]);
  });

  it("handles malformed package.json", async () => {
    const content = {
      files: new Map([["package.json", "{ invalid json"]]),
      packageJson: null,
    };
    
    const result = await detectStack(content);
    // Should not throw, should return safe defaults
    expect(result).toBeDefined();
  });

  it("detects multiple databases", async () => {
    const packageJson = {
      dependencies: {
        "pg": "1.0.0",
        "mongodb": "4.0.0",
        "redis": "3.0.0",
      },
    };

    const result = await detectStack({ packageJson, files: new Map() });
    
    expect(result.databases).toContain("postgres");
    expect(result.databases).toContain("mongodb");
  });

  it("ignores dev dependencies in count", async () => {
    const packageJson = {
      dependencies: { "express": "1.0.0" },
      devDependencies: { "vitest": "1.0.0", "stripe": "1.0.0" },
    };

    const result = await detectStack({ packageJson, files: new Map() });
    
    // Should not count stripe from devDeps as external_api
    expect(result.external_apis).not.toContain("stripe");
  });
});
```

### `analyzePatterns()` Edge Cases

**Test for:**
```typescript
describe("analyzePatterns", () => {
  it("handles empty files", async () => {
    const content = { files: new Map() };
    const result = await analyzePatterns(content);
    
    expect(result.is_stateful).toBe(false);
    expect(result.write_heavy).toBe(false);
  });

  it("handles comments-only files", async () => {
    const content = {
      files: new Map([
        ["index.js", "// This is a comment\n// Another comment"],
      ]),
    };

    const result = await analyzePatterns(content);
    
    expect(result.is_stateful).toBe(false);
  });

  it("detects stateful patterns", async () => {
    const content = {
      files: new Map([
        ["server.js", "let cachedData = {};\napp.get('/', () => cachedData)"],
      ]),
    };

    const result = await analyzePatterns(content);
    
    expect(result.is_stateful).toBe(true);
  });

  it("estimates concurrency risk from write-heavy + stateful", async () => {
    const content = {
      files: new Map([
        [
          "db.js",
          "let connections = {}; INSERT INTO users VALUES (...); UPDATE users SET ...;",
        ],
      ]),
    };

    const result = await analyzePatterns(content);
    
    expect(result.estimated_concurrency_risk).toBe("high");
  });
});
```

### `calculateLaunchConfidence()` Edge Cases

**Test for:**
```typescript
describe("calculateLaunchConfidence", () => {
  it("handles all zero risk factors", () => {
    const stack = { external_apis: [] } as StackProfile;
    const behavior = {
      is_stateful: false,
      write_heavy: false,
      has_background_jobs: false,
      external_dependency_count: 0,
      estimated_concurrency_risk: "low",
    } as BehaviorProfile;

    const { score } = calculateLaunchConfidence(stack, behavior);
    
    expect(score).toBeGreaterThan(70);
  });

  it("clamps score to 0-100", () => {
    // Even with extreme inputs, score should be 0-100
    const result1 = calculateLaunchConfidence({} as any, {} as any);
    const result2 = calculateLaunchConfidence(
      { external_apis: Array(100).fill("api") } as any,
      { estimated_concurrency_risk: "high" } as any
    );

    expect(result1.score).toBeGreaterThanOrEqual(0);
    expect(result1.score).toBeLessThanOrEqual(100);
    expect(result2.score).toBeGreaterThanOrEqual(0);
    expect(result2.score).toBeLessThanOrEqual(100);
  });

  it("includes factors in explanation", () => {
    const result = calculateLaunchConfidence({} as any, {
      is_stateful: true,
    } as any);

    expect(result.factors).toContain("stores state");
  });
});
```

### Auth Routes Edge Cases

**Test for:**
```typescript
describe("handleSignup", () => {
  it("rejects invalid email", async () => {
    const req = {
      body: { email: "not-an-email", password: "Password123", name: "Test" },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    await handleSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects password too short", async () => {
    const req = {
      body: { email: "test@example.com", password: "short", name: "Test" },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    await handleSignup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects duplicate email", async () => {
    // First signup succeeds
    // Second signup with same email fails
    
    const req1 = {
      body: { email: "test@example.com", password: "Password123", name: "Test" },
    } as Request;
    const res1 = { status: vi.fn(), json: vi.fn() } as unknown as Response;
    
    await handleSignup(req1, res1);
    expect(res1.status).toHaveBeenCalledWith(200);

    // Second attempt
    const req2 = {
      body: { email: "test@example.com", password: "Password123", name: "Test" },
    } as Request;
    const res2 = { status: vi.fn(), json: vi.fn() } as unknown as Response;
    
    await handleSignup(req2, res2);
    expect(res2.status).toHaveBeenCalledWith(409);
  });

  it("hashes password before storing", async () => {
    const req = {
      body: { email: "test@example.com", password: "Password123", name: "Test" },
    } as Request;
    const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;

    await handleSignup(req, res);

    // Get user from DB and check password is hashed
    const user = await getOne("SELECT * FROM users WHERE email = $1", ["test@example.com"]);
    expect(user.password_hash).not.toBe("Password123");
    expect(user.password_hash).toMatch(/^\$2[aby]/); // bcrypt hash
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific file
npm test -- auth.spec.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Test Checklist

Before marking a service complete:

- [ ] Happy path test (normal case works)
- [ ] Validation tests (invalid input rejected)
- [ ] Edge case tests (empty, null, extreme values)
- [ ] Error path tests (graceful failure)
- [ ] Integration test (works with real DB/API if applicable)
- [ ] Determinism test (same input = same output) for algorithms
- [ ] Boundary tests (limits are enforced)

## Common Testing Patterns

### Mocking Database

```typescript
import { vi } from "vitest";

vi.mock("@/server/db/client", () => ({
  getOne: vi.fn(),
  getMany: vi.fn(),
  query: vi.fn(),
}));

import { getOne } from "@/server/db/client";

test("fetches user", async () => {
  vi.mocked(getOne).mockResolvedValue({
    id: "123",
    email: "test@example.com",
  } as any);

  const result = await getUser("123");
  
  expect(result.email).toBe("test@example.com");
});
```

### Mocking External APIs

```typescript
import { vi } from "vitest";

vi.mock("octokit", () => ({
  Octokit: class {
    repos = {
      get: vi.fn(),
    };
  },
}));

test("handles GitHub API error", async () => {
  const { Octokit } = await import("octokit");
  vi.mocked(Octokit.prototype.repos.get).mockRejectedValue(
    new Error("404 Not Found")
  );

  const result = await cloneGitHubRepo("fake/repo");
  
  expect(result).toBeNull();
});
```

### Async/Promise Testing

```typescript
test("resolves with correct data", async () => {
  const result = await analyzeApp({...});
  expect(result).toBeDefined();
});

test("rejects on error", async () => {
  await expect(analyzeApp({...})).rejects.toThrow();
});
```

