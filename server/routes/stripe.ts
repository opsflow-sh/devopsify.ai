import type { Request, Response } from "express";

/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session
 *
 * Body: { analysisId, planId }
 * Headers: Authorization: Bearer {sessionToken}
 * Response: { checkoutUrl: string }
 */
export async function handleCreateCheckout(req: Request, res: Response) {
  try {
    const { analysisId, planId } = req.body;
    const userId = (req as any).userId;

    // TODO: Claude Code
    // 1. Validate analysisId (user owns it)
    // 2. Fetch pricing_plans by planId
    // 3. Create Stripe checkout session with:
    //    - line_items: [{ price: plan.stripe_price_id, quantity: 1 }]
    //    - customer_email: user.email
    //    - metadata: { analysisId, userId }
    //    - success_url: https://domain.com/app/watch?analysisId=XXX
    //    - cancel_url: https://domain.com/upgrade?analysisId=XXX
    // 4. Store watch_mode_subscriptions record (status='pending')
    // 5. Return { checkoutUrl: session.url }
    //
    // Dependencies: stripe package (npm install stripe)

    res.json({
      checkoutUrl: "placeholder",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create checkout" });
  }
}

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 *
 * This endpoint is called by Stripe for events:
 * - charge.succeeded
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const sig = req.headers["stripe-signature"] as string;
    // const event = stripe.webhooks.constructEvent(req.rawBody, sig, ENDPOINT_SECRET);

    // TODO: Claude Code
    // 1. Verify webhook signature using Stripe SDK
    // 2. Check event.type:
    //    - 'customer.subscription.created':
    //      Update watch_mode_subscriptions to status='active'
    //    - 'customer.subscription.deleted':
    //      Update watch_mode_subscriptions to status='canceled'
    //    - 'invoice.payment_succeeded':
    //      Log payment success
    // 3. Return { received: true }
    //
    // Important: This webhook must be raw (not JSON parsed)
    // Express app needs: app.use('/api/stripe/webhook', express.raw({type: 'application/json'}))

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: "Webhook failed" });
  }
}

/**
 * GET /api/stripe/subscription
 * Get current subscription status
 *
 * Headers: Authorization: Bearer {sessionToken}
 * Response: { subscription: WatchModeSubscription | null }
 */
export async function handleGetSubscription(req: Request, res: Response) {
  try {
    const analysisId = req.query.analysisId as string;
    const userId = (req as any).userId;

    // TODO: Claude Code
    // 1. Fetch watch_mode_subscriptions where user_id = $1 AND analysis_id = $2
    // 2. Return subscription or null

    res.json({
      subscription: null,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
}
