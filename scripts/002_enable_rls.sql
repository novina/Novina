-- Enable Row Level Security on all tables
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_embeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

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

-- Scraper policies (admin only in practice)
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
