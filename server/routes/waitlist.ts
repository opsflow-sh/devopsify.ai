import { RequestHandler } from "express";
import { z } from "zod";

const WaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  appType: z.string().optional(),
  builtOnReplit: z.string().optional(),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type WaitlistRequest = z.infer<typeof WaitlistSchema>;

export const handleWaitlist: RequestHandler = (req, res) => {
  try {
    const body = WaitlistSchema.parse(req.body);

    console.log("Waitlist signup:", {
      email: body.email,
      appType: body.appType,
      builtOnReplit: body.builtOnReplit,
      githubUrl: body.githubUrl,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Successfully joined the waitlist",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || "Validation error",
      });
    }

    console.error("Waitlist error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process waitlist signup",
    });
  }
};
