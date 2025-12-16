// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// App Analysis & Profile
export interface AppAnalysis {
  id: string;
  user_id: string;
  github_url?: string;
  uploaded_file_name?: string;
  status: "pending" | "completed" | "failed";
  stack_detection: StackProfile;
  behavior_profile: BehaviorProfile;
  launch_confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface StackProfile {
  runtime?: string; // node, python, go, etc
  framework?: string; // express, django, etc
  database?: string; // postgresql, mongodb, sqlite, etc
  databases?: string[]; // list of detected databases
  external_apis?: string[];
  has_background_jobs?: boolean;
  has_file_uploads?: boolean;
  deployment_platform?: string; // replit, vercel, etc
}

export interface BehaviorProfile {
  is_stateful: boolean;
  write_heavy: boolean;
  has_background_jobs: boolean;
  has_file_uploads: boolean;
  estimated_concurrency_risk: "low" | "medium" | "high";
  external_dependency_count: number;
}

// Risk Scenarios
export interface RiskScenario {
  id: string;
  title: string;
  plain_explanation: string;
  trigger_condition: string; // internal
  user_symptom: string;
  severity: "low" | "medium" | "high";
  order: number;
}

// Platform Recommendation
export interface PlatformRecommendation {
  platform_id: string; // replit, vercel, aws, etc
  platform_name: string;
  recommended_badge: string;
  why_bullets: string[]; // max 2
  when_it_changes: string;
  confidence_note: string;
}

// Next Best Step
export interface NextBestStepRecommendation {
  mode: "do_nothing" | "watch_one_thing" | "small_upgrade";
  headline: string;
  explanation: string;
  cta_text: string;
  upgrade_required: boolean;
}

// Launch Verdict (Complete Analysis Result)
export interface LaunchVerdict {
  analysis_id: string;
  status: "safe" | "watch" | "fix";
  confidence_score: number;
  one_line_summary: string;
  risks: RiskScenario[];
  platform_recommendation: PlatformRecommendation;
  next_best_step: NextBestStepRecommendation;
}

// Alerts
export interface Alert {
  id: string;
  user_id: string;
  analysis_id: string;
  category:
    | "usage_growth"
    | "cost_risk"
    | "architecture_drift"
    | "platform_suitability"
    | "stability_regression";
  severity: "informational" | "heads_up" | "action_soon";
  title: string;
  body: string;
  what_changed?: string;
  next_step?: string;
  created_at: string;
  read_at?: string;
}

// Watch Mode & Monitoring
export interface WatchModeSubscription {
  id: string;
  user_id: string;
  analysis_id: string;
  status: "active" | "paused" | "canceled";
  plan: "watch_mode" | "growth_guard" | "production_plus";
  last_check_at?: string;
  confidence_score_at_last_check?: number;
  created_at: string;
  updated_at: string;
  stripe_subscription_id?: string;
}

// Prepared Changes
export interface PreparedChange {
  id: string;
  analysis_id: string;
  phase: 1 | 2 | 3;
  title: string;
  description: string;
  what_changes: string[];
  what_stays_same: string[];
  risk_level: "low" | "medium" | "high";
  status: "prepared" | "applied" | "rolled_back";
  generated_config?: Record<string, unknown>;
  created_at: string;
  applied_at?: string;
  rolled_back_at?: string;
}

// Vibe Spec
export interface VibeCodeSpec {
  analysis_id: string;
  stage: "mvp" | "watch" | "growth" | "production";
  app_context: string;
  primary_goals: string[];
  non_goals: string[];
  environment_assumptions: string[];
  operational_expectations: string[];
  growth_awareness: string[];
  coding_instructions: string[];
  generated_at: string;
}

// Stripe / Subscription
export interface PricingPlan {
  id: string;
  name: string;
  price_cents: number; // in cents (e.g., 1900 = $19.00)
  currency: string;
  billing_period: "monthly" | "yearly";
  features: string[];
  status: "active" | "archived";
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: "active" | "paused" | "canceled";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  canceled_at?: string;
}
