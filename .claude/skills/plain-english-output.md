# Claude Code Skill: Plain English Output & User-Facing Copy

## Overview

DevOpsify.ai's core value is making DevOps expertise accessible to vibe coders and solo founders. EVERY user-facing text must be plain English with ZERO DevOps jargon.

This is non-negotiable. Users should never feel talked down to or confused.

## The Golden Rule

If a vibe coder (someone who doesn't know DevOps) reads it and thinks "What does that mean?", it's WRONG.

Test every user-facing string by asking: "Would a high school student understand this without Googling?"

## Forbidden Words & Phrases

These words should NEVER appear in user-facing output:

### Infrastructure Words ❌

- "Infrastructure" / "Infra"
- "Orchestration" / "Orchestrator"
- "Containerization" / "Containers"
- "Virtualization" / "Virtual machines"
- "Cloud architecture"
- "Distributed systems"
- "Microservices" / "Monolithic"
- "Decoupling" / "Loose coupling"
- "Fault tolerance"

### DevOps/Operations Words ❌

- "CI/CD pipeline"
- "GitOps"
- "Infrastructure as Code" / "IaC"
- "Configuration management"
- "Provisioning"
- "Orchestration"
- "Deployment pipeline"
- "Build artifacts"

### Technical Operations ❌

- "Kubernetes" / "K8s"
- "Docker"
- "Terraform"
- "Ansible"
- "CloudFormation"
- "kubectl"
- "Helm"

### Monitoring/Observability ❌

- "Observability"
- "Distributed tracing"
- "Span"
- "Instrumentation"
- "Telemetry"
- "SLO" / "SLI"
- "Error budget"
- "Service level objective"

### Database/Performance ❌

- "Latency"
- "Throughput"
- "IOPS"
- "Query optimization"
- "Index optimization"
- "Query planner"
- "Execution plan"

### Scaling ❌

- "Horizontal scaling" / "Scale out"
- "Vertical scaling" / "Scale up"
- "Auto-scaling"
- "Load balancing"
- "Cluster"
- "Node"
- "Shard" / "Sharding"
- "Replica"

### Network/Protocol ❌

- "TCP" / "UDP"
- "Latency"
- "Bandwidth"
- "Connection pool"
- "Protocol buffer"
- "gRPC"
- "RPC"

## Approved Alternatives

When you need to describe technical concepts, use these plain English alternatives:

| Instead of             | Use                                             |
| ---------------------- | ----------------------------------------------- |
| "Infrastructure"       | "Your app's setup" or "How your app runs"       |
| "Containerization"     | "How your app is packaged"                      |
| "Latency"              | "How fast responses are" or "Slowdown"          |
| "Throughput"           | "How many people can use it at once"            |
| "Auto-scaling"         | "Growing bigger to handle more people"          |
| "Load balancing"       | "Spreading traffic across servers"              |
| "Health checks"        | "Quick checks to make sure your app is running" |
| "Probes"               | "Quick health checks"                           |
| "Observability"        | "Ability to see what's happening"               |
| "Monitoring"           | "Watching for problems"                         |
| "Alerting"             | "Getting notified when something changes"       |
| "Availability"         | "Being up and running"                          |
| "Resilience"           | "Bouncing back when something breaks"           |
| "Failover"             | "Automatically switching if something breaks"   |
| "Rollback"             | "Going back to the previous version"            |
| "Deployment"           | "Pushing code live"                             |
| "Replication"          | "Keeping copies of data"                        |
| "Consistency"          | "Data being the same everywhere"                |
| "Partition tolerance"  | "Still working even if parts break"             |
| "Session affinity"     | "Keeping you connected to the same server"      |
| "Graceful degradation" | "Still working (slower) if something breaks"    |
| "Circuit breaker"      | "Stopping requests when something is broken"    |

## Where Plain English Rules Apply

### 1. RiskScenario Output

**File:** Risk scenarios shown on "What could go wrong?" screen

**Example from Database:**

```sql
INSERT INTO risk_scenarios (title, plain_explanation, user_symptom)
VALUES (
  'Slower responses under heavy use',
  'If ~100+ people use this at once, requests may start timing out.',
  'Pages feel slow or fail to load'
);
```

**❌ WRONG VERSION:**

```
title: "Database contention with concurrent writes"
explanation: "Write-heavy workloads exceed database concurrency limits"
symptom: "Latency spikes beyond SLO thresholds"
```

**✅ CORRECT VERSION:**

```
title: "Slower responses under heavy use"
explanation: "If many people use this at once, requests may start timing out"
symptom: "Pages feel slow or fail to load"
```

### 2. LaunchVerdict.one_line_summary

**File:** Shown to users after analysis

**❌ WRONG:**

```
"Your app's infrastructure is not ready for production deployment"
```

**✅ CORRECT:**

```
"Your app is mostly safe to share. If usage grows quickly, you might see slowdowns."
```

### 3. PlatformRecommendation.why_bullets

**File:** Shown when recommending platform

**❌ WRONG:**

```
- "Handles horizontal scaling automatically"
- "Native support for Kubernetes orchestration"
```

**✅ CORRECT:**

```
- "Handles your current usage well"
- "Keeps things simple while you grow"
```

### 4. NextBestStepRecommendation

**File:** Single action shown to user

**❌ WRONG:**

```
headline: "Implement database replication before handling payments"
explanation: "Your data layer requires read-write consistency patterns and multi-region failover"
```

**✅ CORRECT:**

```
headline: "Before charging users, switch to a managed database"
explanation: "This reduces contention and makes growth smoother"
```

### 5. Alert.body and Alert.what_changed

**File:** Alert messages

**❌ WRONG:**

```
"Database query execution time exceeded 95th percentile threshold"
"Connection pool saturation detected - failover required"
```

**✅ CORRECT:**

```
"Your app is responding more slowly than usual"
"More people are using your app at the same time"
```

### 6. VibeCodeSpec Output

**File:** Build spec for vibe coding tools

**❌ WRONG:**

```
"Do not implement synchronous blocking operations in request handlers"
"Avoid tight coupling between domain and infrastructure layers"
```

**✅ CORRECT:**

```
"Don't let slow tasks block user requests"
"Keep different parts of your app separate so they can grow at their own pace"
```

## Tone Guidelines

### Be Calm, Not Alarmist

**❌ WRONG:** "Your app will crash if you don't fix this immediately"
**✅ CORRECT:** "Your app might have slowdowns if usage keeps growing. You don't need to act yet."

### Be Specific, Not Generic

**❌ WRONG:** "Your app has problems"
**✅ CORRECT:** "If 100+ people use this at once, database writes may get stuck"

### Be Honest, Not Selling

**❌ WRONG:** "You need to upgrade to Production+ tier to survive growth"
**✅ CORRECT:** "When this becomes a real business, we can help you prepare a more stable setup"

### Be Actionable, Not Vague

**❌ WRONG:** "Consider optimizing your infrastructure"
**✅ CORRECT:** "Before charging users, switch to a managed database"

## Copy Consistency

All user-facing text should follow DevOpsify's voice:

- **Calm** - No alarmism or pressure
- **Clear** - No jargon or confusion
- **Specific** - Not generic platitudes
- **Honest** - Acknowledges limitations
- **Kind** - Respects the builder's knowledge level

## Examples: Good vs Bad

### Example 1: Concurrent Users Risk

**❌ BAD:**

```
Title: "Database concurrency contention"
Explanation: "High-frequency write workloads may exceed connection pool limits and cause query queue saturation"
User symptom: "502 Bad Gateway errors due to deadlock detection timeouts"
```

**✅ GOOD:**

```
Title: "Slower responses under heavy use"
Explanation: "If ~100+ people use this at once, database writes may get stuck behind each other"
User symptom: "Pages feel slow or fail to load during activity spikes"
```

### Example 2: Cost Risk

**❌ BAD:**

```
Title: "Serverless invocation cost explosion"
Explanation: "Your workload pattern triggers cold starts and concurrent function scaling costs"
User symptom: "Monthly bill increased by 400% due to invocation count spike"
```

**✅ GOOD:**

```
Title: "Surprise cost increase"
Explanation: "If traffic jumps suddenly, your monthly bill could rise faster than expected"
User symptom: "Unexpected bill increase when usage spikes"
```

### Example 3: Architecture Drift

**❌ BAD:**

```
Title: "Synchronous I/O blocking in critical path"
Explanation: "Stateful session handling creates request affinity issues and prevents horizontal scaling"
User symptom: "Request timeouts during concurrent request floods"
```

**✅ GOOD:**

```
Title: "Long-running tasks may slow down user requests"
Explanation: "Background work running in the same process as user requests can cause delays"
User symptom: "App freezes during heavy background work"
```

## Checklist: Plain English Compliance

Before committing any user-facing text:

- [ ] No DevOps jargon (check against forbidden words list)
- [ ] Specific to this user's app (not generic)
- [ ] Explains "what happens" not "why technically"
- [ ] Explains "what the user notices" (user symptom)
- [ ] No alarmism or unnecessary urgency
- [ ] Actionable (clear next steps if any)
- [ ] A vibe coder could understand it without Googling
- [ ] Matches tone: calm, clear, honest, kind

## Implementation Notes

### Where to Apply This Skill

1. **RiskScenario database records** - Must be plain English
2. **Alert messages** - Generated from alerts service
3. **Judgment engine outputs** - All strings returned to user
4. **Response JSON** - All user-facing text
5. **Frontend error messages** - All error messages shown to users

### Where This Doesn't Apply

- Code comments (can be technical)
- Internal variable names (can be technical)
- Logging (can be technical for debugging)
- Documentation/specs for developers (can be technical)

### Testing Plain English

For every user-facing string, ask yourself:

1. Does it contain a forbidden word?
2. Would a non-technical person understand it?
3. Is it specific to this user's situation?
4. Does it explain what happens, not why technically?
5. Is the tone calm and kind?

If ANY answer is no, rewrite it.
