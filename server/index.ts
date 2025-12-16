import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleWaitlist } from "./routes/waitlist";
import { handleSignup, handleLogin, handleGetMe, handleLogout } from "./routes/auth";
import { handleAnalyze, handleGetAnalysis, handleRecheckAnalysis } from "./routes/analyze";
import { handleGetAlerts, handleMarkAlertAsRead } from "./routes/alerts";
import { handleCreateCheckout, handleStripeWebhook, handleGetSubscription } from "./routes/stripe";

// TODO: Implement auth middleware
// This should verify sessionToken and set req.userId
// import { requireAuth } from "./middleware/auth";
// const requireAuth = (req: any, res: any, next: any) => {
//   // Placeholder: will be implemented by Claude Code
//   next();
// };

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // Special handler for Stripe webhook (raw body)
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Marketing site - Public routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/waitlist", handleWaitlist);

  // Auth routes - Public
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/me", handleGetMe); // TODO: Apply requireAuth middleware

  // App routes - Protected (TODO: Apply requireAuth middleware to all)
  app.post("/api/analyze", handleAnalyze);
  app.get("/api/analyze/:analysisId", handleGetAnalysis);
  app.post("/api/analyze/:analysisId/recheck", handleRecheckAnalysis);

  // Alert routes - Protected
  app.get("/api/alerts", handleGetAlerts);
  app.patch("/api/alerts/:alertId/read", handleMarkAlertAsRead);

  // Stripe routes - Protected (except webhook)
  app.post("/api/stripe/checkout", handleCreateCheckout);
  app.get("/api/stripe/subscription", handleGetSubscription);

  return app;
}
