import type {
  AppAnalysis,
  LaunchVerdict,
  RiskScenario,
  PlatformRecommendation,
  NextBestStepRecommendation,
  StackProfile,
  BehaviorProfile,
} from "@/shared/types";

/**
 * Calculates launch confidence score (0-100)
 * Based on weighted factors: statefulness, data contention, dependencies
 */
export async function calculateLaunchConfidence(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile
): Promise<{
  score: number;
  factors: string[];
}> {
  // TODO: Claude Code to implement:
  // Weighted scoring algorithm:
  // - Statefulness (0-30 points): Stateless apps are safer
  // - Data handling (0-30 points): Write-heavy = higher risk
  // - Dependencies (0-20 points): More external deps = more risk
  // - Concurrency (0-20 points): High concurrency risk = lower confidence
  //
  // Return score 0-100 and array of factors used in calculation
  // Example factors:
  // - "App is stateless (safer)"
  // - "Uses managed database (lower risk)"
  // - "Has 3 external API dependencies"
  // - "No background jobs detected"

  return {
    score: 72, // placeholder
    factors: [],
  };
}

/**
 * Detects risks based on app profile
 * Returns max 3 most critical risks, plain language
 */
export async function detectRisks(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile
): Promise<RiskScenario[]> {
  // TODO: Claude Code to implement:
  // Risk detection logic (from spec 02, 07):
  // 1. Database contention risk
  //    - If write_heavy and database is SQLite/basic:
  //      "Slower responses under heavy use"
  //
  // 2. Cost explosion risk
  //    - If serverless or pay-as-you-go:
  //      "Surprise cost increase"
  //
  // 3. External dependency risk
  //    - If external_dependency_count > 2:
  //      "External dependency risk"
  //
  // 4. Architecture drift risk
  //    - If has_background_jobs and write_heavy:
  //      "Background jobs may slow down user requests"
  //
  // 5. Concurrency/scaling risk
  //    - If is_stateful or estimated_concurrency_risk == "high":
  //      "Growth may expose concurrency issues"
  //
  // Select top 3 by severity
  // Use plain English explanations from risk_scenarios table
  // Return array of RiskScenario objects

  return [];
}

/**
 * Recommends the best platform for current app stage
 * Prioritizes current platform if it still works
 */
export async function recommendPlatform(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
  currentPlatform?: string
): Promise<PlatformRecommendation> {
  // TODO: Claude Code to implement:
  // Platform recommendation logic:
  // 1. Check if current platform still works (if provided)
  //    - Replit works well for: low-to-moderate traffic, simple setups
  //    - Vercel works for: serverless, API routes
  //    - AWS works for: everything but needs management
  //
  // 2. Recommend staying on current platform if appropriate
  //    - Unless risk profile suggests upgrade needed
  //
  // 3. If current platform doesn't fit:
  //    - Recommend next best platform based on stack
  //
  // 4. Generate "why_bullets" (max 2) explaining choice
  // 5. Generate "when_it_changes" explaining when upgrade is needed
  //
  // Return PlatformRecommendation object with explanation

  return {
    platform_id: "replit",
    platform_name: "Replit",
    recommended_badge: "✅ Recommended right now",
    why_bullets: ["Handles your current usage well", "Keeps things simple while you grow"],
    when_it_changes: "If usage grows 5–10×, this setup may need an upgrade.",
    confidence_note: "You're not missing out by staying here.",
  };
}

/**
 * Recommends next action based on app analysis
 * Returns single, non-overwhelming action
 */
export async function recommendNextStep(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
  stage: "mvp" | "watch" | "growth" | "production"
): Promise<NextBestStepRecommendation> {
  // TODO: Claude Code to implement:
  // Next step recommendation logic:
  //
  // MVP Stage:
  // - Usually "do_nothing" or "watch_one_thing"
  // - Example: "Keep an eye on database usage"
  //
  // Watch/Growth Stage:
  // - Usually "watch_one_thing" or "small_upgrade"
  // - Example: "Before charging users, switch to managed DB"
  //
  // Production Stage:
  // - Usually "small_upgrade" or multi-phase approach
  // - Focus on stability and predictability
  //
  // Return NextBestStepRecommendation object

  return {
    mode: "do_nothing",
    headline: "Nothing right now.",
    explanation: "You're in a good place. Focus on your product.",
    cta_text: "We can watch this for you",
    upgrade_required: false,
  };
}

/**
 * Generates a complete launch verdict from analysis
 * This is the output shown to users
 */
export async function generateLaunchVerdict(
  analysis: AppAnalysis
): Promise<LaunchVerdict> {
  // TODO: Claude Code to implement:
  // 1. Call calculateLaunchConfidence()
  // 2. Call detectRisks()
  // 3. Call recommendPlatform()
  // 4. Call recommendNextStep()
  // 5. Combine into one LaunchVerdict object
  // 6. Determine status: "safe" | "watch" | "fix" based on confidence score:
  //    - score >= 80: "safe"
  //    - score 50-79: "watch"
  //    - score < 50: "fix"
  // 7. Generate one-line summary in plain English
  //
  // Return complete LaunchVerdict

  return {
    analysis_id: analysis.id,
    status: "safe",
    confidence_score: 72,
    one_line_summary: "Your app is safe to share. If usage grows quickly, one part may slow things down.",
    risks: [],
    platform_recommendation: {} as PlatformRecommendation,
    next_best_step: {} as NextBestStepRecommendation,
  };
}
