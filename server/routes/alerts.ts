import type { Request, Response } from "express";

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

    // TODO: Claude Code
    // 1. Build SQL query: SELECT * FROM alerts WHERE user_id = $1
    // 2. If analysisId provided: AND analysis_id = $2
    // 3. ORDER BY created_at DESC
    // 4. LIMIT {limit} OFFSET {offset}
    // 5. Get total count in separate query
    // 6. Return { alerts, total }

    res.json({
      alerts: [],
      total: 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
}

/**
 * PATCH /api/alerts/:alertId/read
 * Mark alert as read
 *
 * Headers: Authorization: Bearer {sessionToken}
 * Response: { alert: Alert }
 */
export async function handleMarkAlertAsRead(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const userId = (req as any).userId;

    // TODO: Claude Code
    // 1. Fetch alert by alertId
    // 2. Verify userId matches (authorization check)
    // 3. Update read_at = NOW()
    // 4. Return updated alert

    res.json({ alert: {} });
  } catch (error) {
    res.status(500).json({ error: "Failed to update alert" });
  }
}
