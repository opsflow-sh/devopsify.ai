import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { query, getOne, executeOne } from "../db/client";

// Validation schemas
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const BCRYPT_ROUNDS = 10;
const SESSION_EXPIRY_DAYS = 30;

/**
 * POST /api/auth/signup
 * Register a new user
 *
 * Body: { email, password, name }
 * Response: { userId, sessionToken, user: User }
 */
export async function handleSignup(req: Request, res: Response) {
  try {
    // 1. Validate input with zod
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.errors,
      });
    }

    const { email, password, name } = validation.data;

    // 2. Check if email already exists
    const existingUser = await getOne(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    // 3. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // 4. Insert user into database
    const user = await getOne(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at, updated_at`,
      [email, name, passwordHash],
    );

    if (!user) {
      return res.status(500).json({
        error: "Failed to create user",
      });
    }

    // 5. Create session (40-char random token)
    const sessionToken = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await executeOne(
      `INSERT INTO sessions (id, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [sessionToken, user.id, expiresAt],
    );

    // 6. Return response
    res.status(201).json({
      userId: user.id,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
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
    // 1. Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: validation.error.errors,
      });
    }

    const { email, password } = validation.data;

    // 2. Fetch user by email
    const user = await getOne(
      `SELECT id, email, name, password_hash, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email],
    );

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // 3. Compare password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // 4. Create new session
    const sessionToken = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    await executeOne(
      `INSERT INTO sessions (id, user_id, expires_at)
       VALUES ($1, $2, $3)`,
      [sessionToken, user.id, expiresAt],
    );

    // 5. Return response (exclude password_hash)
    res.json({
      userId: user.id,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
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
    // 1. Get userId from req.userId (set by auth middleware)
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // 2. Fetch user from users table (exclude password_hash)
    const user = await getOne(
      `SELECT id, email, name, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId],
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // 3. Return user
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
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
    // 1. Get sessionToken from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No session token provided",
      });
    }

    const sessionToken = authHeader.substring(7); // Remove "Bearer " prefix

    // 2. Delete session from sessions table
    await executeOne("DELETE FROM sessions WHERE id = $1", [sessionToken]);

    // 3. Return success
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
}
