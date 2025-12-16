import type { Request, Response } from "express";

/**
 * POST /api/auth/signup
 * Register a new user
 * 
 * Body: { email, password, name }
 * Response: { userId, sessionToken, user: User }
 */
export async function handleSignup(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    // TODO: Claude Code
    // 1. Validate email format (use zod schema)
    // 2. Check if email already exists in users table
    // 3. Hash password using bcrypt
    // 4. Insert into users table
    // 5. Create session record (40 char random token)
    // 6. Return { userId, sessionToken, user }
    // 
    // Errors:
    // - 400: Missing fields, invalid email, password too short
    // - 409: Email already exists
    // - 500: Database error

    res.json({
      userId: "placeholder",
      sessionToken: "placeholder",
      user: {},
    });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
}

/**
 * POST /api/auth/login
 * Authenticate user
 * 
 * Body: { email, password }
 * Response: { userId, sessionToken, user: User }
 */
export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // TODO: Claude Code
    // 1. Validate input
    // 2. Fetch user by email from users table
    // 3. Compare password with stored hash using bcrypt
    // 4. Create new session record
    // 5. Return { userId, sessionToken, user }
    //
    // Errors:
    // - 400: Missing fields
    // - 401: Invalid credentials
    // - 500: Database error

    res.json({
      userId: "placeholder",
      sessionToken: "placeholder",
      user: {},
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * GET /api/auth/me
 * Get current user (requires auth middleware)
 * 
 * Headers: Authorization: Bearer {sessionToken}
 * Response: { user: User }
 */
export async function handleGetMe(req: Request, res: Response) {
  try {
    // TODO: Claude Code
    // 1. Get userId from req.userId (set by auth middleware)
    // 2. Fetch user from users table
    // 3. Return { user }
    //
    // Note: This endpoint requires auth middleware to be applied

    res.json({
      user: {},
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

/**
 * POST /api/auth/logout
 * Logout user (delete session)
 * 
 * Headers: Authorization: Bearer {sessionToken}
 * Response: { success: true }
 */
export async function handleLogout(req: Request, res: Response) {
  try {
    // TODO: Claude Code
    // 1. Get sessionToken from Authorization header
    // 2. Delete from sessions table
    // 3. Return { success: true }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
}
