-- Heritage Hunter Database Schema
-- Initial migration for unclaimed lands data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main lands table
CREATE TABLE IF NOT EXISTS unclaimed_lands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_city TEXT NOT NULL,
  district TEXT NOT NULL,
  section TEXT,
  land_number TEXT NOT NULL,
  owner_name TEXT,
  area_m2 NUMERIC,
  area_ping NUMERIC,
  status TEXT DEFAULT '列管中',
  coordinates JSONB,
  raw_data JSONB,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_city, district, land_number)
);

-- Data sources tracking table
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL UNIQUE,
  dataset_id TEXT,
  api_url TEXT,
  last_synced_at TIMESTAMPTZ,
  record_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- Sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_city TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  error_message TEXT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lands_source_city ON unclaimed_lands(source_city);
CREATE INDEX IF NOT EXISTS idx_lands_district ON unclaimed_lands(district);
CREATE INDEX IF NOT EXISTS idx_lands_owner_name ON unclaimed_lands(owner_name);
CREATE INDEX IF NOT EXISTS idx_lands_search ON unclaimed_lands(source_city, district, owner_name);

-- Full text search index for owner name
CREATE INDEX IF NOT EXISTS idx_lands_owner_name_trgm ON unclaimed_lands USING gin(owner_name gin_trgm_ops);

-- Row Level Security (RLS)
ALTER TABLE unclaimed_lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for lands
CREATE POLICY "Public read access for unclaimed_lands"
  ON unclaimed_lands FOR SELECT
  USING (true);

-- Public read access for data sources
CREATE POLICY "Public read access for data_sources"
  ON data_sources FOR SELECT
  USING (true);

-- Service role full access for all tables
CREATE POLICY "Service role full access for unclaimed_lands"
  ON unclaimed_lands FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access for data_sources"
  ON data_sources FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access for sync_logs"
  ON sync_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Insert initial data sources
INSERT INTO data_sources (city, dataset_id, api_url, status) VALUES
  ('台北市', '134972', 'https://data.taipei/api/v1/dataset/134972', 'active'),
  ('嘉義市', '52344', 'https://data.gov.tw/dataset/52344', 'active'),
  ('嘉義縣', '133739', 'https://data.gov.tw/dataset/133739', 'active'),
  ('彰化縣', '28529', 'https://data.gov.tw/dataset/28529', 'active')
ON CONFLICT (city) DO NOTHING;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_unclaimed_lands_updated_at
  BEFORE UPDATE ON unclaimed_lands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
