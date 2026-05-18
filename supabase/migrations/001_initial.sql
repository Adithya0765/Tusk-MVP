-- ─── TUSK MVP — Initial Schema ───────────────────────────────────────────────
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- ─── Table: users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                     TEXT PRIMARY KEY,          -- Clerk user ID
  email                  TEXT NOT NULL UNIQUE,
  display_name           TEXT,
  tier                   TEXT NOT NULL DEFAULT 'free'
                           CHECK (tier IN ('free', 'starter', 'pro')),
  quota_used             INTEGER NOT NULL DEFAULT 0,
  quota_limit            INTEGER NOT NULL DEFAULT 3,
  quota_reset_at         TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  notify_email           BOOLEAN NOT NULL DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table: sessions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic       TEXT NOT NULL CHECK (char_length(topic) <= 500),
  status      TEXT NOT NULL DEFAULT 'processing'
                CHECK (status IN ('processing', 'complete', 'failed')),
  rounds      INTEGER NOT NULL CHECK (rounds IN (2, 3, 5)),
  error_msg   TEXT,
  share_slug  TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on sessions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Table: turns ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS turns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  round_num   INTEGER NOT NULL,
  agent       TEXT NOT NULL CHECK (agent IN ('A', 'B')),
  content     TEXT NOT NULL,
  token_count INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table: conclusions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conclusions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,   -- JSON string: ConclusionData
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table: notifications_log ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  recipient   TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_msg   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE turns             ENABLE ROW LEVEL SECURITY;
ALTER TABLE conclusions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- users: each user can only read/update their own row
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = current_setting('app.clerk_id', true));

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = current_setting('app.clerk_id', true));

-- sessions: users can CRUD their own sessions; public can read is_public sessions
CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT USING (user_id = current_setting('app.clerk_id', true));

CREATE POLICY "sessions_insert_own" ON sessions
  FOR INSERT WITH CHECK (user_id = current_setting('app.clerk_id', true));

CREATE POLICY "sessions_update_own" ON sessions
  FOR UPDATE USING (user_id = current_setting('app.clerk_id', true));

-- turns: users can CRUD turns for their own sessions
CREATE POLICY "turns_select_own" ON turns
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = current_setting('app.clerk_id', true)
    )
  );

CREATE POLICY "turns_insert_own" ON turns
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = current_setting('app.clerk_id', true)
    )
  );

-- conclusions: users can CRUD conclusions for their own sessions
CREATE POLICY "conclusions_select_own" ON conclusions
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = current_setting('app.clerk_id', true)
    )
  );

CREATE POLICY "conclusions_insert_own" ON conclusions
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = current_setting('app.clerk_id', true)
    )
  );

-- Public read access for share pages (no auth required)
CREATE POLICY "sessions_public_read" ON sessions
  FOR SELECT USING (share_slug IS NOT NULL);

CREATE POLICY "turns_public_read" ON turns
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE share_slug IS NOT NULL AND status = 'complete')
  );

CREATE POLICY "conclusions_public_read" ON conclusions
  FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE share_slug IS NOT NULL AND status = 'complete')
  );

-- notifications_log: service-role only (no user-facing RLS policy needed)
-- The service role key bypasses RLS entirely
