-- ConectaTrampo / PostgreSQL (Neon)
-- Execute este arquivo no SQL Editor do seu projeto Neon.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(80) NOT NULL DEFAULT 'Outros',
  kind VARCHAR(40) NOT NULL CHECK (kind IN ('Emprego','Freelance','Serviço','Link externo')),
  location VARCHAR(120) NOT NULL DEFAULT 'Joinville, SC',
  mode VARCHAR(40) NOT NULL DEFAULT 'A combinar',
  pay VARCHAR(120) NOT NULL DEFAULT '',
  contact VARCHAR(180) NOT NULL DEFAULT '',
  external_url TEXT NOT NULL DEFAULT '',
  source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('external','community')),
  source_title VARCHAR(200) NOT NULL DEFAULT '',
  owner_token_hash CHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','removed')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS opportunities_active_created_idx
  ON opportunities (created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS opportunities_category_idx
  ON opportunities (category) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS opportunities_kind_idx
  ON opportunities (kind) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS opportunities_expires_idx
  ON opportunities (expires_at) WHERE status = 'active';

-- Minimal abuse-reporting table. Avoid collecting reporter identity unless needed.
CREATE TABLE IF NOT EXISTS opportunity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  reason VARCHAR(80) NOT NULL,
  details VARCHAR(1000) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed'))
);
CREATE INDEX IF NOT EXISTS opportunity_reports_open_idx
  ON opportunity_reports (created_at DESC) WHERE status = 'open';
