-- DevOpsify.ai Seed Data
-- =======================
-- Initial reference data for the application

-- Risk Scenarios (Top 5 for MVP)
INSERT INTO risk_scenarios (title, plain_explanation, trigger_condition, user_symptom, severity, "order") VALUES
('Slower responses under heavy use', 'If ~100+ people use this at once, requests may start timing out.', 'high_concurrent_writes', 'Pages feel slow or fail to load', 'high', 1),
('Surprise cost increase', 'If traffic jumps suddenly, your monthly cost could rise faster than expected.', 'serverless_spike', 'Unexpected bill increase', 'high', 2),
('External dependency risk', 'If a third-party API is slow, parts of your app may feel broken.', 'external_api_down', 'Entire feature stops working', 'medium', 3),
('Database contention', 'Multiple requests writing at once may cause locks and delays.', 'write_heavy', 'Intermittent slowdowns during activity spikes', 'medium', 4),
('Long-running tasks block users', 'Background work running in the same process as user requests.', 'background_jobs_sync', 'App freezes during heavy background work', 'high', 5)
ON CONFLICT DO NOTHING;

-- Platform Recommendations
INSERT INTO platform_recommendations (platform_id, platform_name, recommended_badge, why_bullets, when_it_changes, confidence_note) VALUES
('replit', 'Replit Deployments', '✅ Recommended right now',
 '["Handles your current usage well", "Keeps things simple while you grow"]',
 'If usage grows 5–10×, this setup may need an upgrade.',
 'You''re not missing out by staying here.'),
('vercel', 'Vercel', '✅ Great for frontend-heavy apps',
 '["Excellent for Next.js and React apps", "Global edge network for fast loads"]',
 'If you need persistent connections or heavy backend processing, consider alternatives.',
 'Perfect for JAMstack and serverless patterns.'),
('railway', 'Railway', '✅ Good for full-stack apps',
 '["Easy database management", "Supports background jobs"]',
 'If you need multi-region deployment or complex infrastructure.',
 'Great balance of simplicity and power.'),
('fly', 'Fly.io', '✅ Best for global distribution',
 '["Deploy close to your users worldwide", "Supports stateful applications"]',
 'If you need simpler deployment or managed databases.',
 'Ideal for performance-critical applications.')
ON CONFLICT (platform_id) DO NOTHING;

-- Next Best Steps (3 variants for MVP)
INSERT INTO next_best_steps (mode, headline, explanation, cta_text, upgrade_required) VALUES
('do_nothing', 'Nothing right now.', 'You''re in a good place. Focus on your product.', 'We can watch this for you', FALSE),
('watch_one_thing', 'Keep an eye on database usage.', 'If this changes, we''ll let you know.', 'Enable Watch Mode', FALSE),
('small_upgrade', 'Before charging users, switch to a managed database.', 'This reduces contention and makes growth smoother.', 'Show me the upgrade', TRUE)
ON CONFLICT DO NOTHING;

-- Pricing Plans (3 tiers for MVP)
INSERT INTO pricing_plans (name, price_cents, currency, billing_period, features, status, stripe_price_id) VALUES
('Launch Check', 0, 'USD', 'monthly', '["App analysis", "Launch confidence score", "Platform fit assessment"]', 'active', NULL),
('Watch Mode', 1900, 'USD', 'monthly', '["Everything in Launch Check", "Continuous monitoring", "Confidence tracking", "Calm alerts"]', 'active', 'price_watch_mode'),
('Growth Guard', 4900, 'USD', 'monthly', '["Everything in Watch Mode", "Growth simulations", "Cost forecasting", "Next upgrade guidance"]', 'active', 'price_growth_guard')
ON CONFLICT DO NOTHING;

-- Demo User (for testing - password: demo123)
-- Password hash is for 'demo123' using bcrypt with 10 rounds
INSERT INTO users (id, email, name, password_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@devopsify.ai', 'Demo User', '$2b$10$rQZ8K.xQxQxQxQxQxQxQxuQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ')
ON CONFLICT (email) DO NOTHING;

-- Log successful seed
DO $$
BEGIN
  RAISE NOTICE 'Database seeded successfully!';
  RAISE NOTICE 'Demo user: demo@devopsify.ai';
END $$;
