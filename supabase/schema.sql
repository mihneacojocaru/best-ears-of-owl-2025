-- Music Challenge App Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table (simplified)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  best_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nice_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  own_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email)
);

-- Create settings table for admin controls
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('04 A'),
  ('04 B'),
  ('04 C'),
  ('04 D'),
  ('04 E'),
  ('04 F'),
  ('04 G'),
  ('04 H'),
  ('04 I'),
  ('04 J'),
  ('04 K')
ON CONFLICT (name) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('results_public', false)
ON CONFLICT (key) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Categories: Everyone can read
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Categories: Only service role can insert/update/delete
CREATE POLICY "Categories are insertable by service role only"
  ON categories FOR INSERT
  WITH CHECK (false);

-- Votes: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert votes"
  ON votes FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Votes: Only service role can select (admin only)
CREATE POLICY "Votes are only viewable by service role"
  ON votes FOR SELECT
  USING (false);

-- Settings: Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Settings: Everyone can read
CREATE POLICY "Settings are viewable by everyone"
  ON settings FOR SELECT
  USING (true);

-- Settings: Only service role can update
CREATE POLICY "Settings are updatable by service role only"
  ON settings FOR UPDATE
  USING (false);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_user_email ON votes(user_email);
CREATE INDEX IF NOT EXISTS idx_votes_best_category ON votes(best_category_id);
CREATE INDEX IF NOT EXISTS idx_votes_nice_category ON votes(nice_category_id);
CREATE INDEX IF NOT EXISTS idx_votes_own_category ON votes(own_category_id);
