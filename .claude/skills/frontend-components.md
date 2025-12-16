# Claude Code Skill: Frontend Component Architecture

## Overview

Clean, reusable, maintainable React components following established patterns in the codebase.

## Core Rules

### 1. Component Location

**App Shell & Layout Components:**

```
client/components/app/
├── AppShell.tsx         (Main layout wrapper)
├── ProgressIndicator.tsx (FTUE step counter)
├── TopNav.tsx           (Authenticated nav)
└── ...
```

**Pages (Route handlers):**

```
client/pages/app/
├── Connect.tsx          (FTUE step 1)
├── Analyzing.tsx        (FTUE step 2)
├── LaunchVerdict.tsx    (FTUE step 3)
├── RisksScreen.tsx      (FTUE step 4)
├── PlatformFit.tsx      (FTUE step 5)
├── NextStep.tsx         (FTUE step 6)
├── Upgrade.tsx          (Subscription pitch)
├── WatchDashboard.tsx   (Main dashboard)
└── ...
```

**UI Components (Already provided by ShadcN):**

```
client/components/ui/    (Use these: Button, Badge, Dialog, etc)
```

### 2. Type Every Component

**❌ WRONG:**

```typescript
export default function Connect({ onAnalyze, isLoading }) {
  // ...
}
```

**✅ CORRECT:**

```typescript
import type { FC } from "react";

interface ConnectProps {
  onAnalyze: (githubUrl: string) => Promise<void>;
  isLoading: boolean;
}

export const Connect: FC<ConnectProps> = ({ onAnalyze, isLoading }) => {
  // ...
};

export default Connect;
```

### 3. Component Size Limit: 150 Lines

Split components if they exceed 150 lines. Break into smaller pieces:

**❌ WRONG (280 lines in one component):**

```typescript
export function LaunchVerdict() {
  // ... verdict logic
  // ... status badge logic
  // ... confidence meter logic
  // ... risk cards logic
  // ... action buttons logic
  // (all in one file)
}
```

**✅ CORRECT (split into smaller pieces):**

```typescript
// client/components/app/verdicts/VerdictStatus.tsx
interface VerdictStatusProps {
  status: "safe" | "watch" | "fix";
}
export const VerdictStatus: FC<VerdictStatusProps> = ({ status }) => {
  // 30 lines - just the status badge
};

// client/components/app/verdicts/ConfidenceMeter.tsx
interface ConfidenceMeterProps {
  score: number;
}
export const ConfidenceMeter: FC<ConfidenceMeterProps> = ({ score }) => {
  // 40 lines - just the meter
};

// client/pages/app/LaunchVerdict.tsx
import { VerdictStatus } from "@/components/app/verdicts/VerdictStatus";
import { ConfidenceMeter } from "@/components/app/verdicts/ConfidenceMeter";

export default function LaunchVerdict() {
  // 60 lines - orchestrates smaller pieces
  return (
    <VerdictStatus status={verdict.status} />
    <ConfidenceMeter score={verdict.confidence_score} />
  );
}
```

### 4. Use React Hook Form for Forms

**❌ WRONG (manual state management):**

```typescript
export function Connect() {
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // ... submit logic
    setIsSubmitting(false);
  };

  return (
    <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
  );
}
```

**✅ CORRECT (react-hook-form):**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const connectSchema = z.object({
  github_url: z.string().url("Invalid URL"),
});

export function Connect() {
  const form = useForm({
    resolver: zodResolver(connectSchema),
    defaultValues: { github_url: "" },
  });

  const onSubmit = async (data: z.infer<typeof connectSchema>) => {
    await onAnalyze(data.github_url);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("github_url")} />
      <button type="submit" disabled={form.formState.isSubmitting}>
        Analyze
      </button>
    </form>
  );
}
```

### 5. Use React Query for Data Fetching

**❌ WRONG (manual fetch):**

```typescript
export function WatchDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analyze/${analysisId}`)
      .then((r) => r.json())
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) return <div>Loading...</div>;
  return <div>{analysis.status}</div>;
}
```

**✅ CORRECT (react-query):**

```typescript
import { useQuery } from "@tanstack/react-query";

export function WatchDashboard({ analysisId }: Props) {
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: () =>
      fetch(`/api/analyze/${analysisId}`).then((r) => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading analysis</div>;

  return <div>{analysis?.status}</div>;
}
```

### 6. Use ShadcN/Radix UI Components

The codebase already has all ShadcN components. Use them:

**Buttons:**

```typescript
import { Button } from "@/components/ui/button";

<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button disabled>Disabled</Button>
```

**Cards:**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Badges:**

```typescript
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Default</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="secondary">Secondary</Badge>
```

**Dialogs:**

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

**Forms:**

```typescript
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="user@example.com" />

<Label htmlFor="message">Message</Label>
<Textarea id="message" placeholder="Type here..." />
```

### 7. Props Typing Pattern

**Always use interfaces for props:**

```typescript
import type { FC, ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
  activeStep?: number;
}

export const AppShell: FC<AppShellProps> = ({
  children,
  showNav = true,
  showFooter = true,
  activeStep,
}) => {
  return (
    <div>
      {showNav && <TopNav />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
```

### 8. Controlled vs Uncontrolled Components

**Use controlled when you need to:**

- Validate in real-time
- Clear on submit
- Show external state

```typescript
import { useState } from "react";

export function SearchBox() {
  const [search, setSearch] = useState("");

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Use uncontrolled for simple forms (with react-hook-form):**

```typescript
import { useForm } from "react-hook-form";

export function SignupForm() {
  const form = useForm({
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      <input {...form.register("password")} type="password" />
      <button type="submit">Sign up</button>
    </form>
  );
}
```

### 9. Error Boundaries (Optional for MVP)

For async operations, show errors clearly:

```typescript
export function LaunchVerdict() {
  const { data, isError, error } = useQuery({...});

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Analysis Failed</AlertTitle>
        <AlertDescription>
          {error?.message || "Something went wrong. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }

  return <div>{/* content */}</div>;
}
```

### 10. Styling with Tailwind + ShadcN

**Use the `cn` utility for conditional classes:**

```typescript
import { cn } from "@/lib/utils";

interface BadgeProps {
  status: "safe" | "watch" | "fix";
}

export function StatusBadge({ status }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-block px-3 py-1 rounded-full text-sm font-medium",
        status === "safe" && "bg-green-100 text-green-800",
        status === "watch" && "bg-yellow-100 text-yellow-800",
        status === "fix" && "bg-red-100 text-red-800"
      )}
    >
      {status}
    </div>
  );
}
```

### 11. Component Export Pattern

Always use default export for pages, named export for components:

```typescript
// Components
export const ConfidenceMeter: FC<Props> = ({ score }) => {
  // ...
};

// Pages
export default function LaunchVerdict() {
  // ...
}
```

## Common Patterns

### Loading State

```typescript
{isLoading && <div className="text-center text-gray-500">Loading...</div>}
```

### Error State

```typescript
{error && (
  <Alert variant="destructive">
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

### Empty State

```typescript
{data?.length === 0 && (
  <div className="text-center text-gray-500">No data available</div>
)}
```

### Button Loading State

```typescript
<Button disabled={isSubmitting}>
  {isSubmitting ? "Loading..." : "Submit"}
</Button>
```

## Checklist Before Commit

- [ ] All components have typed props
- [ ] Component files <= 150 lines
- [ ] Forms use react-hook-form
- [ ] Data fetching uses react-query
- [ ] UI components from ShadcN used
- [ ] Tailwind classes for styling
- [ ] Error states handled
- [ ] Loading states shown
- [ ] No console.log() in production code
- [ ] Accessibility: buttons have labels, inputs have labels
