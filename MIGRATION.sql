-- Migration: Multi-Week Challenge System
-- Führe dieses SQL im Supabase SQL Editor aus

-- 1. Erstelle challenges Tabelle
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Füge die 10 Challenges hinzu
INSERT INTO challenges (id, number, title, description, is_active) VALUES
  ('01', 1, 'Weihnachtssong, der gerne ab Sommer laufen darf', 'Weihnachtssong, der gerne ab Sommer laufen darf', false),
  ('02', 2, 'Eigentlich peinlich, aber ich mag den', 'Eigentlich peinlich, aber ich mag den', false),
  ('03', 3, 'Nachts mit Fenster unten', 'Nachts mit Fenster unten', false),
  ('04', 4, 'Keine Instrumente, trotzdem fett', 'Keine Instrumente, trotzdem fett', true),
  ('05', 5, 'Ultimativer stank face groove', 'Ultimativer stank face groove', false),
  ('06', 6, 'Build up, build up, build up, gänsehaut', 'Build up, build up, build up, gänsehaut', false),
  ('07', 7, 'Ja, der muss so langsam', 'Ja, der muss so langsam', false),
  ('08', 8, 'Bestes Cover aller Zeiten', 'Bestes Cover aller Zeiten', false),
  ('09', 9, 'Totales Experiment, aber sehr gelungen', 'Totales Experiment, aber sehr gelungen', false),
  ('10', 10, 'Wer nicht weint, hat kein Herz', 'Wer nicht weint, hat kein Herz', false);

-- 3. Füge challenge_id zu categories hinzu
ALTER TABLE categories ADD COLUMN IF NOT EXISTS challenge_id TEXT REFERENCES challenges(id);

-- 4. Update existing categories (04 A-K) to challenge 04
UPDATE categories SET challenge_id = '04' WHERE name LIKE '04%';

-- 5. Füge active_challenge zu settings hinzu (falls settings Tabelle existiert)
-- Wenn settings noch nicht existiert, erstelle sie zuerst:
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Füge results_public hinzu falls noch nicht vorhanden
INSERT INTO settings (key, value, updated_at)
VALUES ('results_public', false, NOW())
ON CONFLICT (key) DO NOTHING;

-- 6. RLS Policies für challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read challenges" ON challenges;
CREATE POLICY "Anyone can read challenges"
  ON challenges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can modify challenges" ON challenges;
CREATE POLICY "Only admins can modify challenges"
  ON challenges FOR ALL
  USING (false);

-- 7. RLS Policies für settings (falls noch nicht vorhanden)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only service role can modify settings" ON settings;
CREATE POLICY "Only service role can modify settings"
  ON settings FOR ALL
  USING (false);

-- Fertig! Jetzt kannst du im Admin-Dashboard zwischen Challenges wechseln
