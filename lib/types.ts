export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  created_at: string
}

export interface Author {
  id: string
  name: string
  type: "human" | "grok" | "claude" | "gemini" | "chatgpt"
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  category_id: string | null
  author_id: string | null
  article_type: "short_news" | "topic_of_day" | "illustration_of_day" | "feature"
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  user_id: string
  batch_id: string | null
  category?: Category
  author?: Author
  illustrations?: Illustration[]
  tweet_embeds?: TweetEmbed[]
  tags?: Tag[] // added tags array to Article interface
}

export interface Illustration {
  id: string
  article_id: string | null
  prompt: string
  image_url: string
  model: string
  created_at: string
  user_id: string
}

export interface Link {
  id: string
  title: string
  url: string
  description: string | null
  category: string | null
  is_featured: boolean
  created_at: string
  user_id: string
}

export interface ScraperSource {
  id: string
  name: string
  url: string
  selector: string | null
  is_active: boolean
  last_scraped: string | null
  created_at: string
  user_id: string
}

export interface ScrapedContent {
  id: string
  source_id: string
  title: string | null
  content: string | null
  original_url: string | null
  scraped_at: string
  is_processed: boolean
  user_id: string
}

export interface TweetEmbed {
  id: string
  article_id: string
  tweet_url: string
  tweet_id: string
  embed_html: string | null
  created_at: string
  user_id: string
}

export interface Profile {
  id: string
  display_name: string | null
  role: "admin" | "editor" | "viewer"
  avatar_url: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  created_at: string
}

export interface NewsBatch {
  id: string
  batch_date: string
  generation_type: "scheduled" | "manual"
  status: "pending" | "processing" | "completed" | "failed"
  articles_generated: number
  error_message: string | null
  created_at: string
  completed_at: string | null
  user_id: string | null
  topic_id: string | null
  provider_id: string | null
  topic?: NewsTopic
  provider?: AIProviderConfig
}

export interface AIProviderConfig {
  id: string
  name: string
  display_name: string
  model_id: string
  is_active: boolean
  is_default: boolean
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface NewsTopic {
  id: string
  name: string
  slug: string
  description: string | null
  prompt_template: string
  icon: string | null
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

