-- Tags table for organizing articles
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT, -- color for tag badge
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Join table for articles and tags (many-to-many)
CREATE TABLE IF NOT EXISTS article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)
);

-- Enable RLS on tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Public can view all tags
CREATE POLICY "Public can view tags" ON tags 
  FOR SELECT USING (true);

-- Public can view article_tags
CREATE POLICY "Public can view article_tags" ON article_tags 
  FOR SELECT USING (true);

-- Authenticated users can manage tags (for admin)
CREATE POLICY "Authenticated can manage tags" ON tags 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Authenticated users can manage article_tags
CREATE POLICY "Authenticated can manage article_tags" ON article_tags 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default tags
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
