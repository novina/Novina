-- Tweet Roast Feature - Database Schema
-- ============================================================================

-- Standalone tweets (not embedded in articles)
CREATE TABLE IF NOT EXISTS standalone_tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_url TEXT NOT NULL,
  tweet_id TEXT NOT NULL,
  tweet_content TEXT, -- cached tweet text for AI context
  tweet_author TEXT, -- @username
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- AI-generated roasts/comments on tweets
CREATE TABLE IF NOT EXISTS tweet_roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id UUID NOT NULL REFERENCES standalone_tweets(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL, -- e.g. "google/gemini-2.5-flash"
  model_name TEXT NOT NULL, -- display name e.g. "Gemini"
  roast_text TEXT NOT NULL,
  roast_type TEXT DEFAULT 'roast' CHECK (roast_type IN ('roast', 'comment', 'analysis')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_standalone_tweets_published ON standalone_tweets(is_published);
CREATE INDEX IF NOT EXISTS idx_tweet_roasts_tweet ON tweet_roasts(tweet_id);

-- Enable RLS
ALTER TABLE standalone_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_roasts ENABLE ROW LEVEL SECURITY;

-- Policies for standalone_tweets
CREATE POLICY "Public can view published tweets" ON standalone_tweets
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated can view all tweets" ON standalone_tweets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage tweets" ON standalone_tweets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for tweet_roasts
CREATE POLICY "Public can view roasts of published tweets" ON tweet_roasts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM standalone_tweets WHERE id = tweet_id AND is_published = true)
  );

CREATE POLICY "Authenticated can view all roasts" ON tweet_roasts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage roasts" ON tweet_roasts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
