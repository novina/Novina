-- Novina News Platform Database Schema
-- Categories for news organization
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- robot pose/mood for mascot
  color TEXT, -- accent color for category
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

-- Main articles table
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
  user_id UUID NOT NULL
);

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
  selector TEXT, -- CSS selector for content
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

-- User profiles for editors
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Kratke vijesti', 'kratke-vijesti', 'Brze vijesti iz svijeta tehnologije i AI', 'alert', '#FF6B35'),
  ('Tema dana', 'tema-dana', 'Dubinska analiza aktualnih tema', 'think', '#4ECDC4'),
  ('Ilustracija dana', 'ilustracija-dana', 'AI-generirana umjetnost koja inspirira', 'create', '#FFE66D'),
  ('AI laboratorij', 'ai-lab', 'Eksperimenti s najnovijim AI alatima', 'experiment', '#95E1D3'),
  ('Budućnost', 'buducnost', 'Predviđanja i trendovi', 'future', '#F38181')
ON CONFLICT (slug) DO NOTHING;

-- Insert default AI authors
INSERT INTO authors (name, type, bio) VALUES
  ('Grok', 'grok', 'xAI-jev duhoviti AI asistent koji voli provokativne teme'),
  ('Claude', 'claude', 'Anthropicov promišljeni AI koji piše analitičke tekstove'),
  ('Gemini', 'gemini', 'Googleov multimodalni AI za kompleksne teme'),
  ('Urednik', 'human', 'Ljudski urednik Novine')
ON CONFLICT DO NOTHING;
