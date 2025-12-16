import type { Request, Response, NextFunction } from "express";

/**
 * Auth middleware
 * Extracts sessionToken from Authorization header and verifies it
 * Sets req.userId if valid
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sessionToken = authHeader.slice(7); // Remove "Bearer "

    // TODO: Claude Code
    // 1. Query sessions table: SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()
    // 2. If not found or expired: return 401
    // 3. If found: set req.userId = session.user_id
    // 4. Call next()
    //
    // This middleware will be applied to all /api/app/* routes

    // Placeholder:
    (req as any).userId = "placeholder";
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication error" });
  }
}
