-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App Analyses
CREATE TABLE app_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_url VARCHAR(500),
  uploaded_file_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  
  -- Stack Detection (JSONB)
  stack_detection JSONB DEFAULT '{}',
  
  -- Behavior Profile (JSONB)
  behavior_profile JSONB DEFAULT '{}',
  
  launch_confidence_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_analyses_user_id ON app_analyses(user_id);
CREATE INDEX idx_app_analyses_status ON app_analyses(status);

-- Risk Scenarios (Reference Data)
CREATE TABLE risk_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  plain_explanation TEXT NOT NULL,
  trigger_condition VARCHAR(255),
  user_symptom TEXT,
  severity VARCHAR(20), -- low, medium, high
  "order" INTEGER,
  visible_in_ftue BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform Recommendations (Reference Data)
CREATE TABLE platform_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id VARCHAR(100) UNIQUE NOT NULL,
  platform_name VARCHAR(255) NOT NULL,
  recommended_badge VARCHAR(255),
  why_bullets JSONB, -- array of strings
  when_it_changes TEXT,
  confidence_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Next Best Step Recommendations (Reference Data)
CREATE TABLE next_best_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode VARCHAR(50) NOT NULL, -- do_nothing, watch_one_thing, small_upgrade
  headline VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  cta_text VARCHAR(255),
  upgrade_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES app_analyses(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- usage_growth, cost_risk, architecture_drift, platform_suitability, stability_regression
  severity VARCHAR(50) NOT NULL, -- informational, heads_up, action_soon
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  what_changed TEXT,
  next_step TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_analysis_id ON alerts(analysis_id);
CREATE INDEX idx_alerts_read_at ON alerts(read_at);

-- Watch Mode Subscriptions
CREATE TABLE watch_mode_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES app_analyses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, canceled
  plan VARCHAR(50) DEFAULT 'watch_mode', -- watch_mode, growth_guard, production_plus
  last_check_at TIMESTAMP,
  confidence_score_at_last_check INTEGER,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_watch_subscriptions_user_id ON watch_mode_subscriptions(user_id);
CREATE INDEX idx_watch_subscriptions_analysis_id ON watch_mode_subscriptions(analysis_id);
CREATE INDEX idx_watch_subscriptions_status ON watch_mode_subscriptions(status);

-- Prepared Changes
CREATE TABLE prepared_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES app_analyses(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL, -- 1, 2, 3
  title VARCHAR(255) NOT NULL,
  description TEXT,
  what_changes JSONB, -- array of strings
  what_stays_same JSONB, -- array of strings
  risk_level VARCHAR(50), -- low, medium, high
  status VARCHAR(50) DEFAULT 'prepared', -- prepared, applied, rolled_back
  generated_config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applied_at TIMESTAMP,
  rolled_back_at TIMESTAMP
);

CREATE INDEX idx_prepared_changes_analysis_id ON prepared_changes(analysis_id);

-- Pricing Plans
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price_cents INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  billing_period VARCHAR(50), -- monthly, yearly
  features JSONB, -- array of strings
  status VARCHAR(50) DEFAULT 'active', -- active, archived
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions (Stripe-backed)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES pricing_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  canceled_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Session table (for authentication)
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
