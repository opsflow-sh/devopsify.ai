import { Request, Response, NextFunction } from "express";
import { getOne } from "../db/client";

/**
 * Extended Express Request interface with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
  userId: string;
}

/**
 * Database session schema interface
 */
interface Session {
  id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
}

/**
 * Authentication middleware that validates session tokens
 *
 * Validates the Bearer token from the Authorization header against
 * the sessions table and attaches the userId to the request object.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @returns 401 if token is missing, malformed, expired, or invalid
 * @returns 500 if database error occurs
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      res.status(401).json({ error: "Unauthorized: Missing authorization header" });
      return;
    }

    // Validate Bearer token format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({ error: "Unauthorized: Malformed authorization header" });
      return;
    }

    const token = parts[1];

    // Validate token is not empty
    if (!token || token.trim() === "") {
      res.status(401).json({ error: "Unauthorized: Empty token" });
      return;
    }

    // Query database for valid session
    const session = await getOne<Session>(
      "SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()",
      [token]
    );

    // Check if session exists and is valid
    if (!session) {
      res.status(401).json({ error: "Unauthorized: Session expired or invalid" });
      return;
    }

    // Attach userId to request object for downstream handlers
    (req as AuthenticatedRequest).userId = session.user_id;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error("Authentication error:", error);

    // Return generic error to client (don't expose internal details)
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}

/**
 * Optional middleware to attach user info if authenticated, but don't require it
 * Useful for endpoints that have different behavior for authenticated vs anonymous users
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      next();
      return;
    }

    const token = parts[1];
    if (!token || token.trim() === "") {
      next();
      return;
    }

    const session = await getOne<Session>(
      "SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()",
      [token]
    );

    if (session) {
      (req as AuthenticatedRequest).userId = session.user_id;
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    // For optional auth, continue even on error
    next();
  }
}
