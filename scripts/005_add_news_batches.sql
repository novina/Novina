-- News Batch Tracking for Multi-AI News Generation
-- This migration adds support for tracking batches of AI-generated news

-- News batch tracking table
CREATE TABLE IF NOT EXISTS news_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date DATE NOT NULL,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('scheduled', 'manual')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  articles_generated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add batch_id reference to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES news_batches(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_batch_id ON articles(batch_id);
CREATE INDEX IF NOT EXISTS idx_news_batches_date ON news_batches(batch_date);
CREATE INDEX IF NOT EXISTS idx_news_batches_status ON news_batches(status);

-- Add ChatGPT to authors if not exists
INSERT INTO authors (name, type, bio) VALUES
  ('ChatGPT', 'chatgpt', 'OpenAI-jev raznovrstan AI asistent za različite perspektive')
ON CONFLICT (name) DO NOTHING;
