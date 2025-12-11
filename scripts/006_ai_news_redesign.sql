-- AI News System Redesign - Database Schema
-- Secure storage for AI providers and news topics

-- AI Providers configuration (with encrypted API keys)
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  model_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  icon TEXT,
  color TEXT,
  api_key_encrypted TEXT, -- Store encrypted, never expose
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- News Topics/Categories for generation
CREATE TABLE IF NOT EXISTS news_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  prompt_template TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add topic reference to news_batches
ALTER TABLE news_batches ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES news_topics(id) ON DELETE SET NULL;
ALTER TABLE news_batches ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES ai_providers(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_topics_sort ON news_topics(sort_order);
CREATE INDEX IF NOT EXISTS idx_news_topics_active ON news_topics(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active);

-- Insert default AI provider (Gemini)
INSERT INTO ai_providers (name, display_name, model_id, icon, color, is_default) VALUES
  ('gemini', 'Google Gemini', 'google/gemini-2.5-flash', 'sparkles', '#4285F4', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default news topics
INSERT INTO news_topics (name, slug, description, prompt_template, icon, color, sort_order) VALUES
  ('AI & Tehnologija', 'ai-tech', 'Vijesti iz svijeta umjetne inteligencije i tehnologije', 
   'Generiraj jednu kratku vijest iz svijeta tehnologije i umjetne inteligencije.

Vijest treba biti:
- Aktuelna i relevantna za Tech/AI zajednicu
- Napisana na hrvatskom jeziku
- Dužine 100-150 riječi
- U informativnom ali angažiranom tonu
- Fokusirana na jedan konkretan događaj ili najavu

Odgovori ISKLJUČIVO u JSON formatu:
{
  "title": "Naslov vijesti (max 80 znakova)",
  "excerpt": "Kratak sažetak (max 120 znakova)",
  "content": "Puni tekst vijesti u Markdown formatu"
}

Nemoj dodavati nikakve dodatne komentare, samo JSON.', 
   'cpu', '#8B5CF6', 1)
ON CONFLICT (slug) DO NOTHING;

-- RLS Policies
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_topics ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read providers (without API key)
CREATE POLICY "Authenticated users can read ai_providers" ON ai_providers
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify providers
CREATE POLICY "Admins can manage ai_providers" ON ai_providers
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can read topics
CREATE POLICY "Authenticated users can read news_topics" ON news_topics
  FOR SELECT TO authenticated USING (true);

-- Admins can manage topics
CREATE POLICY "Admins can manage news_topics" ON news_topics
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
