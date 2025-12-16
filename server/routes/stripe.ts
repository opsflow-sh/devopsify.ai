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

    // Validate inputs
    if (!analysisId || !planId) {
      return res.status(400).json({
        error: "Missing required fields: analysisId and planId"
      });
    }

    // TODO: STRIPE INTEGRATION
    // When ready to implement real Stripe:
    // 1. Install stripe: npm install stripe
    // 2. Initialize: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    // 3. Uncomment the real implementation below

    /* REAL STRIPE IMPLEMENTATION (uncomment when ready):

    import Stripe from 'stripe';
    import { getOne, query } from '../db/client';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });

    // 1. Validate that user owns this analysis
    const analysis = await getOne(
      'SELECT id, user_id FROM app_analyses WHERE id = $1',
      [analysisId]
    );

    if (!analysis || analysis.user_id !== userId) {
      return res.status(403).json({ error: 'Analysis not found or unauthorized' });
    }

    // 2. Fetch pricing plan
    const plan = await getOne(
      'SELECT id, name, price_cents, stripe_price_id FROM pricing_plans WHERE id = $1 AND status = $1',
      [planId, 'active']
    );

    if (!plan || !plan.stripe_price_id) {
      return res.status(404).json({ error: 'Pricing plan not found or not configured' });
    }

    // 3. Get user email
    const user = await getOne('SELECT email FROM users WHERE id = $1', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 4. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: plan.stripe_price_id,
        quantity: 1,
      }],
      mode: 'subscription',
      customer_email: user.email,
      metadata: {
        analysisId,
        userId,
        planId,
      },
      success_url: `${process.env.APP_URL}/app/watch?analysisId=${analysisId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/upgrade?analysisId=${analysisId}`,
    });

    // 5. Create pending subscription record
    await query(
      `INSERT INTO watch_mode_subscriptions
       (user_id, analysis_id, status, plan)
       VALUES ($1, $2, $3, $4)`,
      [userId, analysisId, 'pending', plan.name]
    );

    return res.json({ checkoutUrl: session.url });
    */

    // MVP MOCK IMPLEMENTATION (for demo purposes)
    // This allows the app to function without Stripe configured
    const { getOne, query } = await import("../db/client");

    // Validate that user owns this analysis
    const analysis = await getOne(
      "SELECT id, user_id FROM app_analyses WHERE id = $1",
      [analysisId],
    );

    if (!analysis || analysis.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Analysis not found or unauthorized" });
    }

    // Fetch pricing plan (to validate it exists)
    const plan = await getOne(
      "SELECT id, name, price_cents FROM pricing_plans WHERE id = $1 AND status = $2",
      [planId, "active"],
    );

    if (!plan) {
      return res.status(404).json({ error: "Pricing plan not found" });
    }

    // Create mock subscription (auto-activated for demo)
    const result = await query(
      `INSERT INTO watch_mode_subscriptions
       (user_id, analysis_id, status, plan, stripe_subscription_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, analysisId, "active", plan.name, `demo_sub_${Date.now()}`],
    );

    // Return mock success URL (in real implementation, this would be Stripe's checkout URL)
    return res.json({
      checkoutUrl: `/app/watch?analysisId=${analysisId}&demo=true`,
      subscriptionId: result.rows[0].id,
      message: "Demo mode: Subscription activated immediately",
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout" });
  }
}

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 *
 * This endpoint is called by Stripe for events:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    // TODO: STRIPE WEBHOOK INTEGRATION
    // When ready to implement real Stripe:
    // 1. Ensure Express app.use('/api/stripe/webhook', express.raw({type: 'application/json'}))
    //    This is CRITICAL - webhook signature verification requires raw body
    // 2. Set up Stripe webhook endpoint in Stripe Dashboard
    // 3. Add STRIPE_WEBHOOK_SECRET to environment variables
    // 4. Uncomment the real implementation below

    /* REAL STRIPE WEBHOOK IMPLEMENTATION (uncomment when ready):

    import Stripe from 'stripe';
    import { query, getOne } from '../db/client';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });

    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { analysisId, userId } = session.metadata || {};

        if (analysisId && userId) {
          // Update subscription to active
          await query(
            `UPDATE watch_mode_subscriptions
             SET status = $1, stripe_subscription_id = $2, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $3 AND analysis_id = $4 AND status = $5`,
            ['active', session.subscription, userId, analysisId, 'pending']
          );
          console.log(`Activated subscription for analysis ${analysisId}`);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription created: ${subscription.id}`);
        // Additional logic if needed
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status in database
        await query(
          `UPDATE watch_mode_subscriptions
           SET status = $1, updated_at = CURRENT_TIMESTAMP
           WHERE stripe_subscription_id = $2`,
          [subscription.status, subscription.id]
        );
        console.log(`Subscription updated: ${subscription.id} -> ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark subscription as canceled
        await query(
          `UPDATE watch_mode_subscriptions
           SET status = $1, updated_at = CURRENT_TIMESTAMP
           WHERE stripe_subscription_id = $2`,
          ['canceled', subscription.id]
        );
        console.log(`Subscription canceled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for subscription: ${invoice.subscription}`);

        // Optionally update last_check_at or log payment
        if (invoice.subscription) {
          await query(
            `UPDATE watch_mode_subscriptions
             SET last_check_at = CURRENT_TIMESTAMP
             WHERE stripe_subscription_id = $1`,
            [invoice.subscription]
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(`Payment failed for subscription: ${invoice.subscription}`);

        // Optionally notify user or update status
        // Could create an alert in the alerts table
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
    */

    // MVP MOCK IMPLEMENTATION (for demo purposes)
    // Log webhook events but don't process them
    const eventType = req.body?.type || "unknown";

    console.log(`[DEMO MODE] Received Stripe webhook: ${eventType}`);

    // In demo mode, we auto-activate subscriptions on creation,
    // so webhooks are not critical for MVP functionality

    return res.json({
      received: true,
      demo: true,
      message: "Demo mode: Webhook acknowledged but not processed",
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({ error: "Webhook failed" });
  }
}

/**
 * GET /api/stripe/subscription
 * Get current subscription status
 *
 * Headers: Authorization: Bearer {sessionToken}
 * Query: analysisId (optional - if not provided, returns all user subscriptions)
 * Response: { subscription: WatchModeSubscription | null, plan?: PricingPlan }
 */
export async function handleGetSubscription(req: Request, res: Response) {
  try {
    const analysisId = req.query.analysisId as string;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { getOne, getMany } = await import("../db/client");

    // If analysisId provided, get specific subscription
    if (analysisId) {
      const subscription = await getOne(
        `SELECT
          ws.*,
          aa.github_url,
          aa.uploaded_file_name,
          aa.status as analysis_status
         FROM watch_mode_subscriptions ws
         LEFT JOIN app_analyses aa ON ws.analysis_id = aa.id
         WHERE ws.user_id = $1 AND ws.analysis_id = $2
         ORDER BY ws.created_at DESC
         LIMIT 1`,
        [userId, analysisId],
      );

      // If subscription exists and has a plan name, try to fetch plan details
      let plan = null;
      if (subscription && subscription.plan) {
        plan = await getOne(
          "SELECT id, name, price_cents, currency, billing_period, features FROM pricing_plans WHERE name = $1",
          [subscription.plan],
        );
      }

      return res.json({
        subscription,
        plan,
      });
    }

    // If no analysisId, return all user subscriptions
    const subscriptions = await getMany(
      `SELECT
        ws.*,
        aa.github_url,
        aa.uploaded_file_name,
        aa.status as analysis_status
       FROM watch_mode_subscriptions ws
       LEFT JOIN app_analyses aa ON ws.analysis_id = aa.id
       WHERE ws.user_id = $1
       ORDER BY ws.created_at DESC`,
      [userId],
    );

    return res.json({
      subscriptions,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
}
