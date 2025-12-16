import type { Alert, BehaviorProfile } from "@/shared/types";
import { getMany, query } from "../db/client";

/**
 * Evaluates which alerts should be sent based on profile changes
 * Rules:
 * - Max 1 alert per category per 7 days
 * - Only fire if correlation >= 2 signals
 * - Include reassurance text
 */
export async function evaluateAlerts(
  analysisId: string,
  userId: string,
  newProfile: BehaviorProfile,
  previousProfile?: BehaviorProfile
): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // Check recent alerts to avoid spam (7 day cooldown per category)
  const recentAlerts = await getMany<Alert>(
    `SELECT * FROM alerts
     WHERE user_id = $1 AND analysis_id = $2
     AND created_at > NOW() - INTERVAL '7 days'`,
    [userId, analysisId]
  );

  const recentCategories = new Set(recentAlerts.map(a => a.category));

  // Only check for changes if we have previous profile
  if (!previousProfile) return alerts;

  // Alert conditions:

  // 1. Usage growth: concurrency risk increased
  if (
    !recentCategories.has("usage_growth") &&
    previousProfile.estimated_concurrency_risk !== "high" &&
    newProfile.estimated_concurrency_risk === "high"
  ) {
    alerts.push(createAlert(
      userId,
      analysisId,
      "usage_growth",
      "heads_up",
      "Your app is handling more traffic",
      "We noticed your app's usage patterns have changed. This is a good sign — it means people are using it more.",
      "Concurrency risk increased from " + previousProfile.estimated_concurrency_risk + " to high",
      "Keep an eye on response times. If things slow down, we'll let you know what to do."
    ));
  }

  // 2. Cost risk: external dependencies increased significantly
  if (
    !recentCategories.has("cost_risk") &&
    newProfile.external_dependency_count > previousProfile.external_dependency_count + 2
  ) {
    alerts.push(createAlert(
      userId,
      analysisId,
      "cost_risk",
      "informational",
      "New external services detected",
      "Your app now connects to more external services. This is fine, but each service may have its own costs.",
      "External dependencies increased from " + previousProfile.external_dependency_count + " to " + newProfile.external_dependency_count,
      "Review the pricing for any new services you're using."
    ));
  }

  // 3. Architecture drift: stateless -> stateful
  if (
    !recentCategories.has("architecture_drift") &&
    !previousProfile.is_stateful &&
    newProfile.is_stateful
  ) {
    alerts.push(createAlert(
      userId,
      analysisId,
      "architecture_drift",
      "heads_up",
      "Your app now stores state",
      "We detected that your app has started storing data in memory or files. This works fine now, but may cause issues if you need to run multiple copies.",
      "App changed from stateless to stateful",
      "Consider using a database for important data instead of in-memory storage."
    ));
  }

  // 4. Platform suitability: approaching limits
  if (
    !recentCategories.has("platform_suitability") &&
    newProfile.has_background_jobs &&
    newProfile.write_heavy
  ) {
    alerts.push(createAlert(
      userId,
      analysisId,
      "platform_suitability",
      "action_soon",
      "Your setup might need an upgrade soon",
      "With background jobs and frequent database writes, you're doing things that work better with dedicated resources.",
      "Detected background jobs combined with write-heavy patterns",
      "When you're ready, we can show you a smoother setup."
    ));
  }

  // 5. Stability regression: background jobs added
  if (
    !recentCategories.has("stability_regression") &&
    !previousProfile.has_background_jobs &&
    newProfile.has_background_jobs
  ) {
    alerts.push(createAlert(
      userId,
      analysisId,
      "stability_regression",
      "informational",
      "Background tasks detected",
      "Your app now runs tasks in the background. This is common, but make sure long tasks don't slow down user requests.",
      "Background jobs were added",
      "Consider moving heavy tasks to a separate queue if response times suffer."
    ));
  }

  return alerts;
}

function createAlert(
  userId: string,
  analysisId: string,
  category: Alert["category"],
  severity: Alert["severity"],
  title: string,
  body: string,
  what_changed: string,
  next_step: string
): Alert {
  return {
    id: "", // Will be set by database
    user_id: userId,
    analysis_id: analysisId,
    category,
    severity,
    title,
    body,
    what_changed,
    next_step,
    created_at: new Date().toISOString(),
  };
}

/**
 * Saves alerts to the database
 */
export async function saveAlerts(alerts: Alert[]): Promise<Alert[]> {
  const savedAlerts: Alert[] = [];

  for (const alert of alerts) {
    const result = await query(
      `INSERT INTO alerts (user_id, analysis_id, category, severity, title, body, what_changed, next_step)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        alert.user_id,
        alert.analysis_id,
        alert.category,
        alert.severity,
        alert.title,
        alert.body,
        alert.what_changed,
        alert.next_step,
      ]
    );
    savedAlerts.push(result.rows[0]);
  }

  return savedAlerts;
}
