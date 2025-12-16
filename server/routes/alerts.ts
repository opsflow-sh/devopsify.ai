import type { Request, Response } from "express";
import { query, getOne, getMany } from "../db/client";

interface Alert {
  id: string;
  user_id: string;
  analysis_id: string;
  category: string;
  severity: string;
  title: string;
  body: string;
  what_changed: string | null;
  next_step: string | null;
  created_at: Date;
  read_at: Date | null;
}

/**
 * GET /api/alerts
 * Fetch alerts for current user
 *
 * Query: { analysisId?, limit=20, offset=0 }
 * Headers: Authorization: Bearer {sessionToken}
 * Response: { alerts: Alert[], total: number }
 */
export async function handleGetAlerts(req: Request, res: Response) {
  try {
    const { analysisId, limit = "20", offset = "0" } = req.query;
    const userId = (req as any).userId; // from auth middleware

    // Validate and parse query parameters
    const parsedLimit = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    const parsedOffset = Math.max(parseInt(offset as string, 10) || 0, 0);

    // Build query based on whether analysisId is provided
    let alertsQuery: string;
    let countQuery: string;
    let queryParams: unknown[];

    if (analysisId) {
      alertsQuery = `
        SELECT id, user_id, analysis_id, category, severity, title, body,
               what_changed, next_step, created_at, read_at
        FROM alerts
        WHERE user_id = $1 AND analysis_id = $2
        ORDER BY created_at DESC
        LIMIT $3 OFFSET $4
      `;
      countQuery = `
        SELECT COUNT(*) as total
        FROM alerts
        WHERE user_id = $1 AND analysis_id = $2
      `;
      queryParams = [userId, analysisId, parsedLimit, parsedOffset];
    } else {
      alertsQuery = `
        SELECT id, user_id, analysis_id, category, severity, title, body,
               what_changed, next_step, created_at, read_at
        FROM alerts
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      countQuery = `
        SELECT COUNT(*) as total
        FROM alerts
        WHERE user_id = $1
      `;
      queryParams = [userId, parsedLimit, parsedOffset];
    }

    // Execute both queries
    const alerts = await getMany<Alert>(alertsQuery, queryParams);
    const countResult = await getOne<{ total: string }>(
      countQuery,
      analysisId ? [userId, analysisId] : [userId]
    );

    const total = countResult ? parseInt(countResult.total, 10) : 0;

    res.json({
      alerts,
      total,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
}

/**
 * PATCH /api/alerts/:alertId/read
 * Mark alert as read
 *
 * Headers: Authorization: Bearer {sessionToken}
 * Response: { success: true }
 */
export async function handleMarkAlertAsRead(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const userId = (req as any).userId;

    // Validate alertId format (basic UUID validation)
    if (!alertId || typeof alertId !== "string") {
      return res.status(400).json({ error: "Invalid alert ID" });
    }

    // Fetch alert to verify ownership
    const alert = await getOne<Alert>(
      "SELECT id, user_id FROM alerts WHERE id = $1",
      [alertId]
    );

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    // Authorization check: verify user owns this alert
    if (alert.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized access to alert" });
    }

    // Update read_at to current timestamp
    await query(
      "UPDATE alerts SET read_at = CURRENT_TIMESTAMP WHERE id = $1",
      [alertId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({ error: "Failed to update alert" });
  }
}
