-- Initial Content for Novina
-- ============================================================================
-- Run this AFTER running 008_funny_quotes.sql
-- NOTE: User must be created via Supabase Auth UI or API first!
-- ============================================================================

-- Create user via Supabase Dashboard:
-- 1. Go to Authentication > Users > Add user
-- 2. Email: novina@gmail.com
-- 3. Password: gaba12
-- 4. After creation, copy the user's UUID and replace it below

-- Placeholder UUID - REPLACE WITH ACTUAL USER UUID AFTER CREATING USER!
-- Example: DO $$DECLARE user_uuid UUID := 'your-uuid-here'; BEGIN ... END$$;

-- FOR NOW: Let's use a simple approach - we'll insert content without user_id 
-- and update later, OR use the Supabase service role

-- ============================================================================
-- WORKING APPROACH: Create content that will be assigned to first user who logs in
-- ============================================================================

-- First, let's add more curated links
INSERT INTO links (title, url, description, category, is_featured, user_id) VALUES
  ('Anthropic Claude 3.5', 'https://www.anthropic.com/claude', 'Najnapredniji Claude model s izvanrednim reasoning sposobnostima', 'AI Alati', true, '00000000-0000-0000-0000-000000000000'),
  ('OpenAI o1', 'https://openai.com/o1', 'OpenAI-jev najnoviji reasoning model koji razmišlja prije odgovora', 'AI Alati', true, '00000000-0000-0000-0000-000000000000'),
  ('Google Gemini', 'https://gemini.google.com', 'Googleov multimodalni AI asistent', 'AI Alati', true, '00000000-0000-0000-0000-000000000000'),
  ('Perplexity AI', 'https://www.perplexity.ai', 'AI-powered pretraživač koji citira izvore', 'AI Alati', true, '00000000-0000-0000-0000-000000000000'),
  ('Cursor', 'https://cursor.com', 'AI-first IDE koji transformira način pisanja koda', 'Developer Tools', true, '00000000-0000-0000-0000-000000000000'),
  ('v0 by Vercel', 'https://v0.dev', 'Generativni UI alat koji pretvara prompt u React komponente', 'Developer Tools', true, '00000000-0000-0000-0000-000000000000'),
  ('Midjourney', 'https://www.midjourney.com', 'Vodeći AI za generiranje slika', 'AI Kreativnost', true, '00000000-0000-0000-0000-000000000000'),
  ('The Verge - AI', 'https://www.theverge.com/ai-artificial-intelligence', 'Najnovije vijesti iz svijeta AI', 'Vijesti', false, '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTE: For articles, you MUST create the user first because of RLS policies
-- After creating user novina@gmail.com through Supabase Dashboard,
-- run this query to get the UUID:
-- SELECT id FROM auth.users WHERE email = 'novina@gmail.com';
-- Then update the user_id in links table and insert articles
-- ============================================================================

-- After you have the user UUID, run:
-- UPDATE links SET user_id = 'actual-uuid-here' WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Then insert articles with the actual user_id
