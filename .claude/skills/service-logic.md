# Claude Code Skill: Service Logic & Business Rules

## Overview

Core business logic services that make DevOpsify's value proposition work. These encode 20 years of DevOps experience.

## App Understanding Service

### Purpose

Detect the technology stack and behavior patterns of an uploaded app.

### `detectStack(appContent): Promise<StackProfile>`

**Algorithm:**

1. Look for package.json → Node.js/JavaScript
2. Look for requirements.txt → Python
3. Look for go.mod → Go
4. Look for Gemfile → Ruby
5. Parse for frameworks, databases, external APIs

**Example Detection:**

```typescript
// Input: Node.js app with Express + PostgreSQL
export async function detectStack(
  appContent: AppContent,
): Promise<StackProfile> {
  const stack: StackProfile = {
    external_apis: [],
  };

  // Check for package.json
  const packageJson = appContent.packageJson;
  if (packageJson) {
    stack.runtime = "node";

    // Detect framework
    if (packageJson.dependencies?.["express"]) {
      stack.framework = "express";
    } else if (packageJson.dependencies?.["next"]) {
      stack.framework = "next";
    }

    // Detect databases
    if (packageJson.dependencies?.["pg"]) {
      stack.database = "postgresql";
      stack.databases = ["postgresql"];
    } else if (packageJson.dependencies?.["mongoose"]) {
      stack.database = "mongodb";
    }

    // Detect external APIs
    if (packageJson.dependencies?.["stripe"]) {
      stack.external_apis?.push("stripe");
    }
    if (packageJson.dependencies?.["axios"]) {
      stack.external_apis?.push("http-client");
    }
  }

  return stack;
}
```

**Key Rules:**

- Be conservative (don't guess)
- Handle missing files gracefully (return empty values, don't throw)
- Support multiple languages (Node priority, Python secondary)
- Consistent naming ("postgres" not "postgresql", "mongodb" not "mongo")

### `analyzePatterns(appContent): Promise<BehaviorProfile>`

**Detect: Statefulness**

```typescript
// Stateful if:
- Global variables that store state
- Session storage
- In-memory caches
- File-based persistence (not database)

// Not stateful:
- All state in database
- Stateless microservices
- Pure functions
```

**Detect: Write-Heavy**

```typescript
// Write-heavy if:
- More INSERT/UPDATE/DELETE than SELECT
- Batch operations
- Event sourcing patterns
- Logging to file/database on every request

// Not write-heavy:
- Mostly read operations
- Updates happen occasionally
- Stateless APIs
```

**Detect: Background Jobs**

```typescript
// Has background jobs if:
- setTimeout/setInterval
- Queue libraries (Bull, Celery, Sidekiq)
- Cron job patterns
- Event listeners

// No background jobs:
- Pure request/response
- Synchronous operations only
```

**Detect: File Uploads**

```typescript
// Has file uploads if:
- multer/formidable/werkzeug usage
- file write operations
- S3/cloud storage uploads

// No file uploads:
- No upload handling
- Form data for text only
```

**Example:**

```typescript
export async function analyzePatterns(
  appContent: AppContent,
): Promise<BehaviorProfile> {
  const profile: BehaviorProfile = {
    is_stateful: false,
    write_heavy: false,
    has_background_jobs: false,
    has_file_uploads: false,
    estimated_concurrency_risk: "low",
    external_dependency_count: 0,
  };

  let fileContent = "";
  for (const [filename, content] of appContent.files) {
    fileContent += content + "\n";
  }

  // Detect statefulness
  if (
    fileContent.includes("global ") ||
    fileContent.includes("let ") + fileContent.includes("module.exports")
  ) {
    profile.is_stateful = true;
  }

  // Detect write-heavy
  const insertCount = (fileContent.match(/INSERT|UPDATE|DELETE/gi) || [])
    .length;
  const selectCount = (fileContent.match(/SELECT/gi) || []).length;
  if (insertCount > selectCount) {
    profile.write_heavy = true;
  }

  // Detect background jobs
  if (
    fileContent.includes("setTimeout") ||
    fileContent.includes("setInterval") ||
    fileContent.includes("queue")
  ) {
    profile.has_background_jobs = true;
  }

  // Detect file uploads
  if (fileContent.includes("multer") || fileContent.includes("file")) {
    profile.has_file_uploads = true;
  }

  // Estimate concurrency risk
  if (profile.is_stateful || profile.write_heavy) {
    profile.estimated_concurrency_risk = "high";
  }

  return profile;
}
```

## Judgment Engine Service

### Purpose

Analyze detected stack and behavior to produce recommendations.

### `calculateLaunchConfidence(stackProfile, behaviorProfile): Promise<{score, factors}>`

**Algorithm - Deterministic Scoring:**

```typescript
export async function calculateLaunchConfidence(
  stack: StackProfile,
  behavior: BehaviorProfile,
): Promise<{ score: number; factors: string[] }> {
  let score = 0;
  const factors: string[] = [];

  // Statefulness: 0-30 points
  // Stateless apps are safer
  if (behavior.is_stateful) {
    score += 10;
    factors.push(
      "App stores state in memory or files (may cause issues during restarts)",
    );
  } else {
    score += 30;
    factors.push("App is stateless (safer)");
  }

  // Data handling: 0-30 points
  // Clean reads are safer than write-heavy
  if (behavior.write_heavy) {
    score += 10;
    factors.push("App does many writes to database (can cause slowdowns)");
  } else {
    score += 30;
    factors.push("App handles data efficiently");
  }

  // Dependencies: 0-20 points
  // Fewer external APIs = fewer failure points
  const externalDeps = behavior.external_dependency_count || 0;
  if (externalDeps === 0) {
    score += 20;
    factors.push("No external API dependencies");
  } else if (externalDeps <= 3) {
    score += 15;
    factors.push(`${externalDeps} external API dependencies`);
  } else {
    score += 10;
    factors.push(
      `${externalDeps} external API dependencies (watch these closely)`,
    );
  }

  // Concurrency: 0-20 points
  // Low concurrency risk = safer
  if (behavior.estimated_concurrency_risk === "low") {
    score += 20;
    factors.push("Low concurrency risk");
  } else if (behavior.estimated_concurrency_risk === "medium") {
    score += 10;
    factors.push("Medium concurrency risk");
  } else {
    score += 5;
    factors.push("High concurrency risk");
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    factors,
  };
}
```

**Key Rules:**

- Score must be DETERMINISTIC (same input = same output)
- All weights documented
- Score clamped 0-100
- Factors in plain English

### `detectRisks(stack, behavior): Promise<RiskScenario[]>`

**Algorithm:**

1. Load all risk_scenarios from database
2. Score each by relevance to this app
3. Return top 3 by user impact (not technical severity)
4. Plain English explanations

**Example Risk Scoring:**

```typescript
export async function detectRisks(
  stack: StackProfile,
  behavior: BehaviorProfile,
): Promise<RiskScenario[]> {
  const allRisks = await getMany<RiskScenario>(
    "SELECT * FROM risk_scenarios ORDER BY severity DESC",
  );

  const relevantRisks: Array<RiskScenario & { score: number }> = [];

  for (const risk of allRisks) {
    let relevanceScore = 0;

    // "Slower responses under heavy use"
    if (
      risk.title?.includes("Slower responses") &&
      (behavior.write_heavy || behavior.is_stateful)
    ) {
      relevanceScore = 100;
    }

    // "Surprise cost increase"
    if (risk.title?.includes("cost") && stack.external_apis?.length) {
      relevanceScore = 80;
    }

    // "External dependency risk"
    if (
      risk.title?.includes("External") &&
      (behavior.external_dependency_count || 0) > 3
    ) {
      relevanceScore = 90;
    }

    if (relevanceScore > 0) {
      relevantRisks.push({ ...risk, score: relevanceScore });
    }
  }

  // Return top 3
  return relevantRisks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...risk }) => risk);
}
```

### `recommendPlatform(stack, behavior, currentPlatform?): Promise<PlatformRecommendation>`

**Algorithm:**

1. If currentPlatform provided and still fits → recommend staying
2. Else recommend best match from database
3. Always explain "why" and "when it changes"
4. NEVER push away from Replit

**Example:**

```typescript
export async function recommendPlatform(
  stack: StackProfile,
  behavior: BehaviorProfile,
  currentPlatform?: string,
): Promise<PlatformRecommendation> {
  // If on Replit and still works, recommend staying
  if (currentPlatform === "replit") {
    const confidence =
      !behavior.write_heavy &&
      !behavior.is_stateful &&
      behavior.estimated_concurrency_risk !== "high"
        ? 100
        : 70;

    if (confidence >= 70) {
      return {
        platform_id: "replit",
        platform_name: "Replit Deployments",
        recommended_badge: "✅ Recommended right now",
        why_bullets: [
          "Handles your current usage well",
          "Keeps things simple while you grow",
        ],
        when_it_changes:
          "If usage grows 5–10×, this setup may need an upgrade.",
        confidence_note: "You're not missing out by staying here.",
      };
    }
  }

  // Get best fit from database
  const platforms = await getMany<PlatformRecommendation>(
    "SELECT * FROM platform_recommendations",
  );

  return platforms[0]; // Simplified - in reality, score based on stack
}
```

### `recommendNextStep(stack, behavior, stage): Promise<NextBestStepRecommendation>`

**Algorithm:**

1. Analyze current stage (mvp, watch, growth, production)
2. Determine ONE action only
3. No task lists, no overwhelm

**Example:**

```typescript
export async function recommendNextStep(
  stack: StackProfile,
  behavior: BehaviorProfile,
  stage: "mvp" | "watch" | "growth" | "production",
): Promise<NextBestStepRecommendation> {
  // MVP stage: focus on sharing
  if (stage === "mvp") {
    return {
      mode: "do_nothing",
      headline: "Nothing right now.",
      explanation: "You're in a good place. Focus on your product.",
      cta_text: "We can watch this for you",
      upgrade_required: false,
    };
  }

  // Watch/Growth stage: focus on stability
  if (stage === "watch" && behavior.write_heavy) {
    return {
      mode: "small_upgrade",
      headline: "Before charging users, switch to a managed database.",
      explanation: "This reduces contention and makes growth smoother.",
      cta_text: "Show me the upgrade",
      upgrade_required: true,
    };
  }

  // Default
  return {
    mode: "watch_one_thing",
    headline: "Keep an eye on database usage.",
    explanation: "If this changes, we'll let you know.",
    cta_text: "Enable Watch Mode",
    upgrade_required: false,
  };
}
```

## Key Principles

### Determinism

Every algorithm must be deterministic. Same input always produces same output.

### Conservatism

When unsure, be conservative. Don't flag risks that aren't likely.

### Plain English

All outputs in plain English, no jargon.

### Single Responsibility

Each function does ONE thing well.

### Testable

Every algorithm should be testable with unit tests.

## Caching Strategy

For expensive operations, cache for 10 minutes:

```typescript
const cache = new Map<string, { data: unknown; expires: number }>();

export async function analyzeWithCache(repoUrl: string) {
  const cacheKey = repoUrl;
  const cached = cache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const result = await analyzeApp(repoUrl);
  cache.set(cacheKey, {
    data: result,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  return result;
}
```
