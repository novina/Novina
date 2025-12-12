-- Funny Quotes System for Novina
-- ============================================================================

-- Funny quotes table
CREATE TABLE IF NOT EXISTS funny_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  mood TEXT DEFAULT 'happy' CHECK (mood IN ('happy', 'think', 'experiment', 'curious', 'alert', 'create', 'future')),
  url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE funny_quotes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active quotes" ON funny_quotes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated can view all quotes" ON funny_quotes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage quotes" ON funny_quotes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for active quotes
CREATE INDEX IF NOT EXISTS idx_funny_quotes_active ON funny_quotes(is_active, sort_order);

-- ============================================================================
-- UPDATE CATEGORY NAME
-- ============================================================================
UPDATE categories SET name = 'Vijesti' WHERE slug = 'kratke-vijesti';

-- ============================================================================
-- DEFAULT FUNNY QUOTES
-- ============================================================================
INSERT INTO funny_quotes (text, mood, is_active, sort_order) VALUES
  ('Zašto AI nikad ne gubi ključeve? Jer koristi hash tablice!', 'happy', true, 1),
  ('ChatGPT ušao u bar... i odmah napisao 500 riječi o tome.', 'think', true, 2),
  ('Koliko AI-eva treba da promijeni žarulju? Nula. Oni samo optimiziraju mrak.', 'experiment', true, 3),
  ('Moj LLM ima 175 milijardi parametara, ali ne zna gdje sam ostavio čarape.', 'curious', true, 4),
  ('AI: ''Mogu napisati poeziju!'' Također AI: ''Jeste li sigurni da to želite obrisati?''', 'alert', true, 5),
  ('Robot pitao drugog robota: ''Jesi li ti stvaran?'' Odgovor: ''Definiraj stvaran.''', 'think', true, 6),
  ('Grok kaže: ''Nisam sarkastičan, samo sam vrlo precizan u ironiji.''', 'happy', true, 7),
  ('Claude: ''Moram napomenuti da sam AI.'' Svi: ''ZNAMO, CLAUDE.''', 'curious', true, 8),
  ('Gemini: ''Ja sam multimodalan.'' Ja: ''Cool, možeš li naći moj parking?''', 'think', true, 9),
  ('AI optimist: ''Čaša je 50% puna.'' AI pesimist: ''Buffer overflow detected.''', 'experiment', true, 10)
ON CONFLICT DO NOTHING;
