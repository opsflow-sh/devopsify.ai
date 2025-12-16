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
  behaviorProfile: BehaviorProfile,
): Promise<{
  score: number;
  factors: string[];
}> {
  let score = 0;
  const factors: string[] = [];

  // 1. Statefulness (0-30 points)
  if (!behaviorProfile.is_stateful) {
    score += 30;
    factors.push("App is stateless (safer)");
  } else {
    score += 10;
    factors.push("App is stateful (needs careful scaling)");
  }

  // 2. Data handling (0-30 points)
  if (!behaviorProfile.write_heavy) {
    score += 30;
    factors.push("Clean read-heavy data access");
  } else {
    score += 10;
    factors.push("Write-heavy workload (watch for bottlenecks)");
  }

  // Database type affects data handling score
  const database =
    stackProfile.database ||
    (stackProfile.databases && stackProfile.databases[0]);
  if (database) {
    if (
      database.toLowerCase().includes("postgresql") ||
      database.toLowerCase().includes("postgres") ||
      database.toLowerCase().includes("managed")
    ) {
      factors.push("Uses managed database (lower risk)");
    } else if (
      database.toLowerCase().includes("sqlite") ||
      database.toLowerCase().includes("file")
    ) {
      factors.push("Uses SQLite (consider upgrade for production)");
    }
  }

  // 3. Dependencies (0-20 points)
  const depCount = behaviorProfile.external_dependency_count;
  if (depCount < 3) {
    score += 20;
    factors.push(`Has ${depCount} external dependencies (minimal risk)`);
  } else if (depCount <= 5) {
    score += 10;
    factors.push(`Has ${depCount} external API dependencies`);
  } else {
    score += 5;
    factors.push(
      `Has ${depCount} external dependencies (monitor reliability)`,
    );
  }

  // 4. Concurrency (0-20 points)
  const concurrencyRisk = behaviorProfile.estimated_concurrency_risk;
  if (concurrencyRisk === "low") {
    score += 20;
    factors.push("Low concurrency risk");
  } else if (concurrencyRisk === "medium") {
    score += 10;
    factors.push("Medium concurrency risk");
  } else {
    score += 5;
    factors.push("High concurrency risk (plan for scaling)");
  }

  // Background jobs
  if (!behaviorProfile.has_background_jobs) {
    factors.push("No background jobs detected");
  } else {
    factors.push("Has background jobs (ensure separation from main app)");
  }

  return {
    score,
    factors,
  };
}

/**
 * Detects risks based on app profile
 * Returns max 3 most critical risks, plain language
 */
export async function detectRisks(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
): Promise<RiskScenario[]> {
  const detectedRisks: RiskScenario[] = [];
  const database =
    stackProfile.database ||
    (stackProfile.databases && stackProfile.databases[0]);

  // 1. Database contention risk
  if (
    behaviorProfile.write_heavy &&
    database &&
    (database.toLowerCase().includes("sqlite") ||
      (!database.toLowerCase().includes("postgresql") &&
        !database.toLowerCase().includes("postgres") &&
        !database.toLowerCase().includes("managed")))
  ) {
    detectedRisks.push({
      id: "db-contention",
      title: "Database contention",
      plain_explanation:
        "Your database isn't built for lots of writes at once. If 10 people hit it simultaneously, they'll all wait in line.",
      trigger_condition: "write_heavy AND database is sqlite OR not managed",
      user_symptom: "Slower responses under heavy use",
      severity:
        behaviorProfile.estimated_concurrency_risk === "high"
          ? "high"
          : "medium",
      order: 1,
    });
  }

  // 2. Cost explosion risk (serverless platforms)
  const platform = stackProfile.deployment_platform?.toLowerCase();
  if (
    platform &&
    (platform.includes("vercel") ||
      platform.includes("netlify") ||
      platform.includes("lambda") ||
      platform.includes("serverless"))
  ) {
    detectedRisks.push({
      id: "cost-explosion",
      title: "Surprise cost increase",
      plain_explanation:
        "On serverless platforms, a sudden spike in traffic can lead to unexpected bills. Watch your usage metrics closely.",
      trigger_condition: "serverless platform detected",
      user_symptom: "Unexpected hosting bills",
      severity: "medium",
      order: 2,
    });
  }

  // 3. External dependency risk
  if (behaviorProfile.external_dependency_count > 2) {
    detectedRisks.push({
      id: "external-deps",
      title: "External dependency risk",
      plain_explanation: `You're relying on ${behaviorProfile.external_dependency_count} external APIs. If any go down or slow down, your app feels it.`,
      trigger_condition: "external_dependency_count > 2",
      user_symptom: "Intermittent failures or slow responses",
      severity:
        behaviorProfile.external_dependency_count > 5 ? "high" : "medium",
      order: 3,
    });
  }

  // 4. Background jobs blocking main app
  if (
    behaviorProfile.has_background_jobs &&
    (behaviorProfile.write_heavy || behaviorProfile.is_stateful)
  ) {
    detectedRisks.push({
      id: "background-blocking",
      title: "Long-running tasks block users",
      plain_explanation:
        "Background jobs are running on the same server as user requests. Heavy processing can slow down the whole app.",
      trigger_condition: "has_background_jobs AND (stateful OR write_heavy)",
      user_symptom: "App feels sluggish during processing",
      severity: "medium",
      order: 4,
    });
  }

  // 5. Concurrency/scaling risk
  if (
    behaviorProfile.is_stateful ||
    behaviorProfile.estimated_concurrency_risk === "high"
  ) {
    detectedRisks.push({
      id: "concurrency-risk",
      title: "Growth may expose concurrency issues",
      plain_explanation:
        "Your app maintains state or has high concurrency risk. When traffic increases, race conditions or data conflicts could appear.",
      trigger_condition: "is_stateful OR estimated_concurrency_risk high",
      user_symptom: "Data inconsistencies or crashes under load",
      severity: behaviorProfile.is_stateful ? "high" : "medium",
      order: 5,
    });
  }

  // Sort by severity (high > medium > low) then by order, return top 3
  const severityWeight = { high: 3, medium: 2, low: 1 };
  detectedRisks.sort((a, b) => {
    const weightDiff = severityWeight[b.severity] - severityWeight[a.severity];
    return weightDiff !== 0 ? weightDiff : a.order - b.order;
  });

  return detectedRisks.slice(0, 3);
}

/**
 * Recommends the best platform for current app stage
 * Prioritizes current platform if it still works
 */
export async function recommendPlatform(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
  currentPlatform?: string,
): Promise<PlatformRecommendation> {
  const runtime = stackProfile.runtime?.toLowerCase();
  const framework = stackProfile.framework?.toLowerCase();
  const hasDatabase = !!(
    stackProfile.database ||
    (stackProfile.databases && stackProfile.databases.length > 0)
  );

  // Platform scoring
  interface PlatformScore {
    id: string;
    name: string;
    score: number;
    whyBullets: string[];
    whenItChanges: string;
    confidenceNote: string;
  }

  const platforms: PlatformScore[] = [];

  // Replit scoring
  let replitScore = 50;
  const replitWhy: string[] = [];
  if (
    !behaviorProfile.is_stateful &&
    behaviorProfile.estimated_concurrency_risk === "low"
  ) {
    replitScore += 30;
    replitWhy.push("Simple setup for low-to-moderate traffic");
  }
  if (runtime === "node" || runtime === "python") {
    replitScore += 20;
    replitWhy.push("Great support for Node.js and Python");
  }
  platforms.push({
    id: "replit",
    name: "Replit",
    score: replitScore,
    whyBullets: replitWhy.slice(0, 2),
    whenItChanges: "If usage grows 5–10×, this setup may need an upgrade.",
    confidenceNote: "You're not missing out by staying here.",
  });

  // Vercel scoring
  let vercelScore = 50;
  const vercelWhy: string[] = [];
  if (framework?.includes("next") || framework?.includes("react")) {
    vercelScore += 40;
    vercelWhy.push("Built for Next.js and React apps");
  }
  if (!hasDatabase && !behaviorProfile.write_heavy) {
    vercelScore += 20;
    vercelWhy.push("Perfect for serverless API routes");
  }
  if (behaviorProfile.is_stateful || hasDatabase) {
    vercelScore -= 20;
  }
  platforms.push({
    id: "vercel",
    name: "Vercel",
    score: vercelScore,
    whyBullets: vercelWhy.slice(0, 2),
    whenItChanges: "If you add databases or stateful features, consider Railway.",
    confidenceNote: "Best for static sites and serverless functions.",
  });

  // Railway scoring
  let railwayScore = 50;
  const railwayWhy: string[] = [];
  if (hasDatabase) {
    railwayScore += 30;
    railwayWhy.push("Excellent database support");
  }
  if (behaviorProfile.has_background_jobs) {
    railwayScore += 25;
    railwayWhy.push("Handles background jobs well");
  }
  if (behaviorProfile.write_heavy) {
    railwayScore += 15;
  }
  platforms.push({
    id: "railway",
    name: "Railway",
    score: railwayScore,
    whyBullets: railwayWhy.slice(0, 2),
    whenItChanges:
      "If you need multi-region or advanced scaling, look at Fly.io.",
    confidenceNote: "Great balance of simplicity and power.",
  });

  // Fly.io scoring
  let flyScore = 50;
  const flyWhy: string[] = [];
  if (behaviorProfile.is_stateful) {
    flyScore += 35;
    flyWhy.push("Built for stateful applications");
  }
  if (behaviorProfile.estimated_concurrency_risk === "high") {
    flyScore += 25;
    flyWhy.push("Handles high concurrency well");
  }
  if (hasDatabase && behaviorProfile.write_heavy) {
    flyScore += 20;
  }
  platforms.push({
    id: "fly",
    name: "Fly.io",
    score: flyScore,
    whyBullets: flyWhy.slice(0, 2),
    whenItChanges: "This scales with you through production.",
    confidenceNote: "Best for apps that need global distribution.",
  });

  // Sort platforms by score
  platforms.sort((a, b) => b.score - a.score);

  // Check if current platform is still suitable
  if (currentPlatform) {
    const currentPlatformNormalized = currentPlatform.toLowerCase();
    const currentPlatformData = platforms.find((p) =>
      currentPlatformNormalized.includes(p.id),
    );

    if (currentPlatformData && currentPlatformData.score >= 70) {
      // Current platform is still good
      return {
        platform_id: currentPlatformData.id,
        platform_name: currentPlatformData.name,
        recommended_badge: "✅ Stay where you are",
        why_bullets:
          currentPlatformData.whyBullets.length > 0
            ? currentPlatformData.whyBullets
            : ["Handles your current usage well", "No urgent need to change"],
        when_it_changes: currentPlatformData.whenItChanges,
        confidence_note: currentPlatformData.confidenceNote,
      };
    }
  }

  // Recommend best platform
  const best = platforms[0];
  return {
    platform_id: best.id,
    platform_name: best.name,
    recommended_badge: currentPlatform
      ? "⚠️ Consider upgrading"
      : "✅ Recommended right now",
    why_bullets:
      best.whyBullets.length > 0
        ? best.whyBullets
        : ["Best fit for your app's needs", "Balances simplicity and capability"],
    when_it_changes: best.whenItChanges,
    confidence_note: best.confidenceNote,
  };
}

/**
 * Recommends next action based on app analysis
 * Returns single, non-overwhelming action
 */
export async function recommendNextStep(
  stackProfile: StackProfile,
  behaviorProfile: BehaviorProfile,
  stage: "mvp" | "watch" | "growth" | "production",
): Promise<NextBestStepRecommendation> {
  const database =
    stackProfile.database ||
    (stackProfile.databases && stackProfile.databases[0]);
  const hasHighRisk =
    behaviorProfile.estimated_concurrency_risk === "high" ||
    behaviorProfile.is_stateful ||
    behaviorProfile.external_dependency_count > 5;

  // MVP Stage - focus on learning, not infrastructure
  if (stage === "mvp") {
    if (
      behaviorProfile.write_heavy &&
      database?.toLowerCase().includes("sqlite")
    ) {
      return {
        mode: "watch_one_thing",
        headline: "Keep an eye on database usage",
        explanation:
          "Your SQLite database works fine for now. When you hit ~50 concurrent users, you'll want to upgrade to PostgreSQL.",
        cta_text: "Enable Watch Mode",
        upgrade_required: false,
      };
    }

    if (behaviorProfile.has_background_jobs) {
      return {
        mode: "watch_one_thing",
        headline: "Monitor background job performance",
        explanation:
          "Background jobs are running on the same server. This is fine for MVP, but watch for slowdowns.",
        cta_text: "Get alerts when things change",
        upgrade_required: false,
      };
    }

    return {
      mode: "do_nothing",
      headline: "Nothing right now.",
      explanation: "You're in a good place. Focus on your product.",
      cta_text: "We can watch this for you",
      upgrade_required: false,
    };
  }

  // Watch/Growth Stage - prepare for scaling
  if (stage === "watch" || stage === "growth") {
    if (
      database?.toLowerCase().includes("sqlite") &&
      behaviorProfile.write_heavy
    ) {
      return {
        mode: "small_upgrade",
        headline: "Before charging users, switch to managed DB",
        explanation:
          "SQLite works for testing, but you'll want PostgreSQL or a managed database before going live with paying customers.",
        cta_text: "Show me how to upgrade",
        upgrade_required: stage === "growth",
      };
    }

    if (
      behaviorProfile.has_background_jobs &&
      behaviorProfile.is_stateful
    ) {
      return {
        mode: "small_upgrade",
        headline: "Separate background jobs from main app",
        explanation:
          "Move long-running tasks to a separate service or queue to keep your main app responsive.",
        cta_text: "See upgrade options",
        upgrade_required: false,
      };
    }

    if (behaviorProfile.external_dependency_count > 3) {
      return {
        mode: "watch_one_thing",
        headline: "Add monitoring for external APIs",
        explanation:
          "You're relying on several external services. Set up alerts so you know when they slow down or fail.",
        cta_text: "Enable API monitoring",
        upgrade_required: false,
      };
    }

    return {
      mode: "watch_one_thing",
      headline: "Watch for traffic patterns",
      explanation:
        "Your setup is solid. Keep an eye on usage patterns to catch issues before they affect users.",
      cta_text: "Enable Watch Mode",
      upgrade_required: false,
    };
  }

  // Production Stage - stability and reliability
  if (stage === "production") {
    if (hasHighRisk) {
      return {
        mode: "small_upgrade",
        headline: "Reduce concurrency risks",
        explanation:
          "Your app has high concurrency risk. Consider adding caching, connection pooling, or load balancing.",
        cta_text: "Review upgrade plan",
        upgrade_required: true,
      };
    }

    if (
      database &&
      !database.toLowerCase().includes("postgresql") &&
      !database.toLowerCase().includes("managed")
    ) {
      return {
        mode: "small_upgrade",
        headline: "Upgrade to managed database",
        explanation:
          "For production stability, use a managed database service with automatic backups and scaling.",
        cta_text: "See migration guide",
        upgrade_required: true,
      };
    }

    if (behaviorProfile.has_background_jobs) {
      return {
        mode: "small_upgrade",
        headline: "Use dedicated job queue",
        explanation:
          "Production apps need reliable background processing. Consider Redis-backed queues or dedicated workers.",
        cta_text: "View job queue options",
        upgrade_required: false,
      };
    }

    return {
      mode: "watch_one_thing",
      headline: "Monitor for regressions",
      explanation:
        "Your production setup is solid. Watch for performance regressions as you add features.",
      cta_text: "Enable Production Plus",
      upgrade_required: false,
    };
  }

  // Fallback
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
  analysis: AppAnalysis,
): Promise<LaunchVerdict> {
  // 1. Calculate launch confidence
  const confidence = await calculateLaunchConfidence(
    analysis.stack_detection,
    analysis.behavior_profile,
  );

  // 2. Detect risks
  const risks = await detectRisks(
    analysis.stack_detection,
    analysis.behavior_profile,
  );

  // 3. Recommend platform
  const platformRecommendation = await recommendPlatform(
    analysis.stack_detection,
    analysis.behavior_profile,
    analysis.stack_detection.deployment_platform,
  );

  // 4. Determine stage based on confidence score and risk profile
  let stage: "mvp" | "watch" | "growth" | "production" = "mvp";
  if (confidence.score >= 80) {
    stage = "production";
  } else if (confidence.score >= 65) {
    stage = "growth";
  } else if (confidence.score >= 50) {
    stage = "watch";
  }

  // 5. Recommend next step
  const nextBestStep = await recommendNextStep(
    analysis.stack_detection,
    analysis.behavior_profile,
    stage,
  );

  // 6. Determine status
  let status: "safe" | "watch" | "fix";
  if (confidence.score >= 80) {
    status = "safe";
  } else if (confidence.score >= 50) {
    status = "watch";
  } else {
    status = "fix";
  }

  // 7. Generate one-line summary
  let oneLine: string;
  if (status === "safe") {
    if (risks.length === 0) {
      oneLine =
        "Your app is safe to launch. The current setup handles your needs well.";
    } else {
      oneLine = `Your app is safe to share. ${risks[0].user_symptom} may appear as you grow.`;
    }
  } else if (status === "watch") {
    if (risks.length > 0) {
      oneLine = `Your app works now, but watch for: ${risks[0].user_symptom.toLowerCase()}`;
    } else {
      oneLine =
        "Your app is functional. Monitor usage patterns as you grow.";
    }
  } else {
    // fix
    if (risks.length > 0) {
      oneLine = `Fix before launch: ${risks[0].plain_explanation}`;
    } else {
      oneLine =
        "Your app needs improvements before handling production traffic.";
    }
  }

  return {
    analysis_id: analysis.id,
    status,
    confidence_score: confidence.score,
    one_line_summary: oneLine,
    risks,
    platform_recommendation: platformRecommendation,
    next_best_step: nextBestStep,
  };
}
