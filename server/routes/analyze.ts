import type { Request, Response } from "express";
import type { AppAnalysis, LaunchVerdict } from "@/shared/types";
import { query, getOne } from "../db/client";
import {
  cloneGitHubRepo,
  detectStack,
  analyzePatterns,
} from "../services/appUnderstanding";
import { generateLaunchVerdict } from "../services/judgmentEngine";
import { evaluateAlerts, saveAlerts } from "../services/alertOrchestrator";

/**
 * Validates GitHub URL format
 */
function isValidGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "github.com" &&
      parsed.pathname.split("/").filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
}

/**
 * POST /api/analyze
 * Accepts GitHub URL or ZIP upload
 * Returns: { analysisId, status, verdict }
 */
export async function handleAnalyze(req: Request, res: Response) {
  try {
    const { github_url, uploaded_file } = req.body;
    const userId = (req as any).userId;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate input - must have either github_url or uploaded_file
    if (!github_url && !uploaded_file) {
      return res.status(400).json({
        error: "Missing required field: github_url or uploaded_file",
      });
    }

    // Phase 1: Focus on GitHub URL (ZIP upload is phase 2)
    if (uploaded_file) {
      return res.status(400).json({
        error: "File upload not yet supported. Please provide a github_url.",
      });
    }

    // Validate GitHub URL format
    if (!isValidGitHubUrl(github_url)) {
      return res.status(400).json({
        error: "Invalid GitHub URL. Must be a valid github.com repository URL.",
      });
    }

    // Create app_analyses record with status='pending'
    const createResult = await query<AppAnalysis>(
      `INSERT INTO app_analyses (user_id, github_url, status, stack_detection, behavior_profile, launch_confidence_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, github_url, "pending", "{}", "{}", 0]
    );

    const analysis = createResult.rows[0];
    const analysisId = analysis.id;

    try {
      // Clone GitHub repository and extract content
      const appContent = await cloneGitHubRepo(github_url);

      // Detect technology stack
      const stackProfile = await detectStack(appContent);

      // Analyze behavior patterns
      const behaviorProfile = await analyzePatterns(appContent);

      // Generate launch verdict
      const partialAnalysis: AppAnalysis = {
        ...analysis,
        stack_detection: stackProfile,
        behavior_profile: behaviorProfile,
      };

      const verdict = await generateLaunchVerdict(partialAnalysis);

      // Update app_analyses with results and status='completed'
      await query(
        `UPDATE app_analyses
         SET status = $1,
             stack_detection = $2,
             behavior_profile = $3,
             launch_confidence_score = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [
          "completed",
          JSON.stringify(stackProfile),
          JSON.stringify(behaviorProfile),
          verdict.confidence_score,
          analysisId,
        ]
      );

      // Return success response with verdict
      return res.status(201).json({
        analysisId,
        status: "completed",
        verdict,
      });
    } catch (analysisError) {
      // Update status to 'failed' on error
      await query(
        `UPDATE app_analyses SET status = $1, updated_at = NOW() WHERE id = $2`,
        ["failed", analysisId]
      );

      console.error("Analysis error:", analysisError);

      // Provide specific error messages for common issues
      if (analysisError instanceof Error) {
        if (analysisError.message.includes("rate limit")) {
          return res.status(429).json({
            error: "GitHub API rate limit exceeded. Please try again later.",
            analysisId,
          });
        }
        if (analysisError.message.includes("not found")) {
          return res.status(404).json({
            error: "Repository not found or not accessible.",
            analysisId,
          });
        }
      }

      return res.status(500).json({
        error: "Analysis failed during processing",
        analysisId,
      });
    }
  } catch (error) {
    console.error("Analysis request error:", error);
    return res.status(500).json({
      error: "Analysis failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * GET /api/analyze/:analysisId
 * Returns analysis results and verdict
 */
export async function handleGetAnalysis(req: Request, res: Response) {
  try {
    const { analysisId } = req.params;
    const userId = (req as any).userId;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate analysisId
    if (!analysisId) {
      return res.status(400).json({ error: "Missing analysisId parameter" });
    }

    // Fetch analysis from database
    const analysis = await getOne<AppAnalysis>(
      `SELECT * FROM app_analyses WHERE id = $1`,
      [analysisId]
    );

    // Check if analysis exists
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Check authorization - user must own this analysis
    if (analysis.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not own this analysis" });
    }

    // Generate fresh verdict with current data
    const verdict = await generateLaunchVerdict(analysis);

    // Return complete analysis with verdict
    return res.json({
      analysis: {
        id: analysis.id,
        github_url: analysis.github_url,
        uploaded_file_name: analysis.uploaded_file_name,
        status: analysis.status,
        stack_detection: analysis.stack_detection,
        behavior_profile: analysis.behavior_profile,
        launch_confidence_score: analysis.launch_confidence_score,
        created_at: analysis.created_at,
        updated_at: analysis.updated_at,
      },
      verdict,
      risks: verdict.risks,
      platformRecommendation: verdict.platform_recommendation,
      nextBestStep: verdict.next_best_step,
    });
  } catch (error) {
    console.error("Get analysis error:", error);
    return res.status(500).json({
      error: "Failed to fetch analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /api/analyze/:analysisId/recheck
 * Re-run analysis on existing app
 * Used in Watch Mode
 */
export async function handleRecheckAnalysis(req: Request, res: Response) {
  try {
    const { analysisId } = req.params;
    const userId = (req as any).userId;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate analysisId
    if (!analysisId) {
      return res.status(400).json({ error: "Missing analysisId parameter" });
    }

    // Fetch existing analysis
    const existingAnalysis = await getOne<AppAnalysis>(
      `SELECT * FROM app_analyses WHERE id = $1`,
      [analysisId]
    );

    // Check if analysis exists
    if (!existingAnalysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // Check authorization
    if (existingAnalysis.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not own this analysis" });
    }

    // Check if we have a GitHub URL to recheck
    if (!existingAnalysis.github_url) {
      return res.status(400).json({
        error:
          "Cannot recheck analysis without GitHub URL. File uploads cannot be rechecked.",
      });
    }

    // Store old profile for comparison
    const oldBehaviorProfile = existingAnalysis.behavior_profile;

    try {
      // Re-clone and re-analyze
      const appContent = await cloneGitHubRepo(existingAnalysis.github_url);
      const newStackProfile = await detectStack(appContent);
      const newBehaviorProfile = await analyzePatterns(appContent);

      // Evaluate alerts by comparing old and new profiles
      const alerts = await evaluateAlerts(
        analysisId,
        userId,
        newBehaviorProfile,
        oldBehaviorProfile
      );

      // Save alerts to database
      const savedAlerts = await saveAlerts(alerts);

      // Generate new verdict
      const updatedAnalysis: AppAnalysis = {
        ...existingAnalysis,
        stack_detection: newStackProfile,
        behavior_profile: newBehaviorProfile,
      };

      const verdict = await generateLaunchVerdict(updatedAnalysis);

      // Update analysis with new results
      await query(
        `UPDATE app_analyses
         SET stack_detection = $1,
             behavior_profile = $2,
             launch_confidence_score = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          JSON.stringify(newStackProfile),
          JSON.stringify(newBehaviorProfile),
          verdict.confidence_score,
          analysisId,
        ]
      );

      // Return updated verdict and new alerts
      return res.json({
        updated: true,
        verdict,
        newAlerts: savedAlerts,
        alertCount: savedAlerts.length,
        previousConfidenceScore: existingAnalysis.launch_confidence_score,
        newConfidenceScore: verdict.confidence_score,
      });
    } catch (recheckError) {
      console.error("Recheck analysis error:", recheckError);

      // Provide specific error messages
      if (recheckError instanceof Error) {
        if (recheckError.message.includes("rate limit")) {
          return res.status(429).json({
            error: "GitHub API rate limit exceeded. Please try again later.",
          });
        }
        if (recheckError.message.includes("not found")) {
          return res.status(404).json({
            error: "Repository no longer accessible.",
          });
        }
      }

      return res.status(500).json({
        error: "Recheck failed during processing",
        details:
          recheckError instanceof Error
            ? recheckError.message
            : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Recheck request error:", error);
    return res.status(500).json({
      error: "Recheck failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
