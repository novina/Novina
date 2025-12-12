-- =============================================================================
-- NOVINA DATABASE SCHEMA - COMBINED MIGRATION
-- Run this in Supabase SQL Editor to set up the complete database
-- =============================================================================

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Categories for news organization
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authors (LLMs or human editors)
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('human', 'grok', 'claude', 'gemini', 'chatgpt')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table for organizing articles
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles for editors
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. NEWS BATCHES (must be before articles for reference)
-- ============================================================================

CREATE TABLE IF NOT EXISTS news_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('scheduled', 'manual')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  articles_generated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  topic_id UUID,
  provider_id UUID
);

-- ============================================================================
-- 3. MAIN ARTICLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  article_type TEXT NOT NULL CHECK (article_type IN ('short_news', 'topic_of_day', 'illustration_of_day', 'feature')),
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL,
  batch_id UUID REFERENCES news_batches(id) ON DELETE SET NULL
);

-- Join table for articles and tags (many-to-many)
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================================================
-- 4. RELATED TABLES
-- ============================================================================

-- AI-generated illustrations
CREATE TABLE IF NOT EXISTS illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  model TEXT DEFAULT 'fal-ai/flux/schnell',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL
);

-- Link vault - curated links for readers
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL
);

-- Web scraper sources
CREATE TABLE IF NOT EXISTS scraper_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  selector TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_scraped TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL
);

-- Scraped content queue
CREATE TABLE IF NOT EXISTS scraped_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scraper_sources(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  original_url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  is_processed BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL
);

-- Twitter/X embeds
CREATE TABLE IF NOT EXISTS tweet_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tweet_url TEXT NOT NULL,
  tweet_id TEXT NOT NULL,
  embed_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL
);

-- ============================================================================
-- 5. AI NEWS SYSTEM TABLES
-- ============================================================================

-- AI Providers configuration
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  model_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  icon TEXT,
  color TEXT,
  api_key_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- News Topics for generation
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

-- Add foreign key references to news_batches
ALTER TABLE news_batches ADD CONSTRAINT fk_topic FOREIGN KEY (topic_id) REFERENCES news_topics(id) ON DELETE SET NULL;
ALTER TABLE news_batches ADD CONSTRAINT fk_provider FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE SET NULL;

-- ============================================================================
-- 6. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_articles_batch_id ON articles(batch_id);
CREATE INDEX IF NOT EXISTS idx_news_batches_date ON news_batches(batch_date);
CREATE INDEX IF NOT EXISTS idx_news_batches_status ON news_batches(status);
CREATE INDEX IF NOT EXISTS idx_news_topics_sort ON news_topics(sort_order);
CREATE INDEX IF NOT EXISTS idx_news_topics_active ON news_topics(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active);

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_topics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- Articles policies
CREATE POLICY "Public can view published articles" ON articles 
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can create articles" ON articles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles" ON articles 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles" ON articles 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can view all articles" ON articles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Illustrations policies
CREATE POLICY "Public can view illustrations" ON illustrations 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create illustrations" ON illustrations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own illustrations" ON illustrations 
  FOR DELETE USING (auth.uid() = user_id);

-- Links policies
CREATE POLICY "Public can view links" ON links 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage links" ON links 
  FOR ALL USING (auth.uid() = user_id);

-- Scraper policies
CREATE POLICY "Authenticated users can manage scraper sources" ON scraper_sources 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage scraped content" ON scraped_content 
  FOR ALL USING (auth.uid() = user_id);

-- Tweet embeds
CREATE POLICY "Public can view tweet embeds" ON tweet_embeds 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tweet embeds" ON tweet_embeds 
  FOR ALL USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Public can view profiles" ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tags policies
CREATE POLICY "Public can view tags" ON tags 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage tags" ON tags 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Article_tags policies
CREATE POLICY "Public can view article_tags" ON article_tags 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage article_tags" ON article_tags 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- News batches policies
CREATE POLICY "Enable read access for authenticated users" ON news_batches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage batches" ON news_batches
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AI Providers policies
CREATE POLICY "Authenticated users can read ai_providers" ON ai_providers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage ai_providers" ON ai_providers
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- News topics policies
CREATE POLICY "Authenticated users can read news_topics" ON news_topics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage news_topics" ON news_topics
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 9. TRIGGER FOR AUTO-CREATE PROFILE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    COALESCE(new.raw_user_meta_data ->> 'role', 'editor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 10. DEFAULT DATA
-- ============================================================================

-- Default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Kratke vijesti', 'kratke-vijesti', 'Brze vijesti iz svijeta tehnologije i AI', 'alert', '#FF6B35'),
  ('Tema dana', 'tema-dana', 'Dubinska analiza aktualnih tema', 'think', '#4ECDC4'),
  ('Ilustracija dana', 'ilustracija-dana', 'AI-generirana umjetnost koja inspirira', 'create', '#FFE66D'),
  ('AI laboratorij', 'ai-lab', 'Eksperimenti s najnovijim AI alatima', 'experiment', '#95E1D3'),
  ('Budućnost', 'buducnost', 'Predviđanja i trendovi', 'future', '#F38181')
ON CONFLICT (slug) DO NOTHING;

-- Default AI authors
INSERT INTO authors (name, type, bio) VALUES
  ('Grok', 'grok', 'xAI-jev duhoviti AI asistent koji voli provokativne teme'),
  ('Claude', 'claude', 'Anthropicov promišljeni AI koji piše analitičke tekstove'),
  ('Gemini', 'gemini', 'Googleov multimodalni AI za kompleksne teme'),
  ('ChatGPT', 'chatgpt', 'OpenAI-jev raznovrstan AI asistent za različite perspektive'),
  ('Urednik', 'human', 'Ljudski urednik Novine')
ON CONFLICT DO NOTHING;

-- Default tags
INSERT INTO tags (name, slug, description, color) VALUES
  ('AI', 'ai', 'Članci o umjetnoj inteligenciji', '#FF6B6B'),
  ('Tehnologija', 'tehnologija', 'Tehnološke vijesti i inovacije', '#4ECDC4'),
  ('Web3', 'web3', 'Blockchain i decentralizacija', '#FFE66D'),
  ('Kultura', 'kultura', 'Kultura i društvo', '#95E1D3'),
  ('Politika', 'politika', 'Politika i društvena pitanja', '#F38181'),
  ('Startup', 'startup', 'Startup ekosistem', '#A8D8EA'),
  ('Sigurnost', 'sigurnost', 'Cyber sigurnost i privatnost', '#FF7675'),
  ('Design', 'design', 'UI/UX i dizajn', '#B19CD9')
ON CONFLICT (slug) DO NOTHING;

-- Default AI provider (Gemini via OpenRouter)
INSERT INTO ai_providers (name, display_name, model_id, icon, color, is_default) VALUES
  ('gemini', 'Google Gemini', 'google/gemini-2.5-flash', 'sparkles', '#4285F4', true)
ON CONFLICT (name) DO NOTHING;

-- Default news topic
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

-- ============================================================================
-- COMPLETE! Database is ready.
-- ============================================================================
