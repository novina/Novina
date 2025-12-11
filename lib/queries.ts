import { createClient } from "@/lib/supabase/server"
import { cache } from "react"
import type { Article, Category, Author, Link, Illustration, TweetEmbed } from "@/lib/types"

// ============================================================================
// TYPES - Explicit return types for all queries
// ============================================================================

export type ArticleWithRelations = Article & {
    category: Category | null
    author: Author | null
    illustrations?: Illustration[]
    tweet_embeds?: TweetEmbed[]
}

export type ArticlePreview = Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'cover_image' | 'published_at'>

// ============================================================================
// CACHED QUERIES - React cache() za deduplikaciju unutar jednog renderinga
// ============================================================================

/**
 * Dohvati kategoriju po slug-u
 * Cacheirano - identični pozivi u generateMetadata i page se izvršavaju samo jednom
 */
export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single()

    if (error) {
        console.error(`[getCategoryBySlug] Error fetching category ${slug}:`, error.message)
        return null
    }
    return data
})

/**
 * Dohvati članak po slug-u s relacijama
 * Cacheirano - koristi se i za metadata i za stranicu
 */
export const getArticleBySlug = cache(async (slug: string): Promise<ArticleWithRelations | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("articles")
        .select(`
      *,
      category:categories(*),
      author:authors(*),
      illustrations(*),
      tweet_embeds(*)
    `)
        .eq("slug", slug)
        .eq("is_published", true)
        .single()

    if (error) {
        console.error(`[getArticleBySlug] Error fetching article ${slug}:`, error.message)
        return null
    }
    return data as ArticleWithRelations
})

/**
 * Dohvati povezane članke iz iste kategorije
 */
export const getRelatedArticles = cache(async (
    articleId: string,
    categoryId: string | null,
    limit = 3
): Promise<ArticlePreview[]> => {
    if (!categoryId) return []

    const supabase = await createClient()
    const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .eq("is_published", true)
        .neq("id", articleId)
        .eq("category_id", categoryId)
        .order("published_at", { ascending: false })
        .limit(limit)

    if (error) {
        console.error(`[getRelatedArticles] Error:`, error.message)
        return []
    }
    return data || []
})

/**
 * Dohvati članke po kategoriji
 */
export const getArticlesByCategory = cache(async (
    categoryId: string,
    limit?: number
): Promise<ArticleWithRelations[]> => {
    const supabase = await createClient()
    let query = supabase
        .from("articles")
        .select(`
      *,
      category:categories(*),
      author:authors(*)
    `)
        .eq("is_published", true)
        .eq("category_id", categoryId)
        .order("published_at", { ascending: false })

    if (limit) {
        query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
        console.error(`[getArticlesByCategory] Error:`, error.message)
        return []
    }
    return (data || []) as ArticleWithRelations[]
})

/**
 * Dohvati članke po slug-u kategorije - kombinirani query (izbjegava waterfall)
 */
export const getArticlesByCategorySlug = cache(async (
    categorySlug: string,
    limit?: number
): Promise<{ category: Category | null; articles: ArticleWithRelations[] }> => {
    const supabase = await createClient()

    // Koristi inner join umjesto dva odvojena querya
    const { data: articles, error } = await supabase
        .from("articles")
        .select(`
      *,
      category:categories!inner(*),
      author:authors(*)
    `)
        .eq("categories.slug", categorySlug)
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit || 100)

    if (error) {
        console.error(`[getArticlesByCategorySlug] Error:`, error.message)
        return { category: null, articles: [] }
    }

    // Izvuci kategoriju iz prvog članka ako postoji
    const category = articles?.[0]?.category || null

    return {
        category,
        articles: (articles || []) as ArticleWithRelations[]
    }
})

// ============================================================================
// HOMEPAGE QUERIES - Optimizirani batch query
// ============================================================================

export interface HomePageData {
    featuredArticle: ArticleWithRelations | null
    shortNews: ArticleWithRelations[]
    topicOfDay: ArticleWithRelations | null
    illustrationOfDay: (ArticleWithRelations & { illustrations: Illustration[] }) | null
    links: Link[]
}

/**
 * Dohvati sve podatke za homepage u jednom pozivu
 * Koristi Promise.all za paralelno izvršavanje
 */
export const getHomePageData = cache(async (): Promise<HomePageData> => {
    const supabase = await createClient()

    const [featuredRes, shortNewsRes, topicRes, illustrationRes, linksRes] = await Promise.all([
        // Featured article za hero
        supabase
            .from("articles")
            .select("*, category:categories(*), author:authors(*)")
            .eq("is_published", true)
            .eq("is_featured", true)
            .order("published_at", { ascending: false })
            .limit(1),

        // Kratke vijesti
        supabase
            .from("articles")
            .select("*, category:categories(*), author:authors(*)")
            .eq("is_published", true)
            .eq("article_type", "short_news")
            .order("published_at", { ascending: false })
            .limit(6),

        // Tema dana
        supabase
            .from("articles")
            .select("*, category:categories(*), author:authors(*)")
            .eq("is_published", true)
            .eq("article_type", "topic_of_day")
            .order("published_at", { ascending: false })
            .limit(1),

        // Ilustracija dana
        supabase
            .from("articles")
            .select("*, category:categories(*), author:authors(*), illustrations(*)")
            .eq("is_published", true)
            .eq("article_type", "illustration_of_day")
            .order("published_at", { ascending: false })
            .limit(1),

        // Featured linkovi
        supabase
            .from("links")
            .select("*")
            .eq("is_featured", true)
            .order("created_at", { ascending: false })
            .limit(8),
    ])

    return {
        featuredArticle: (featuredRes.data?.[0] as ArticleWithRelations) || null,
        shortNews: (shortNewsRes.data || []) as ArticleWithRelations[],
        topicOfDay: (topicRes.data?.[0] as ArticleWithRelations) || null,
        illustrationOfDay: (illustrationRes.data?.[0] as ArticleWithRelations & { illustrations: Illustration[] }) || null,
        links: (linksRes.data || []) as Link[],
    }
})

// ============================================================================
// AI LAB QUERIES
// ============================================================================

/**
 * Dohvati AI Lab članke - optimizirano bez waterfall-a
 */
export const getAILabArticles = cache(async (limit = 6): Promise<ArticleWithRelations[]> => {
    const supabase = await createClient()

    // Direktan query s inner join - bez potrebe za dva querya
    const { data, error } = await supabase
        .from("articles")
        .select(`
      *,
      category:categories!inner(*),
      author:authors(*)
    `)
        .eq("categories.slug", "ai-lab")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit)

    if (error) {
        console.error(`[getAILabArticles] Error:`, error.message)
        return []
    }

    return (data || []) as ArticleWithRelations[]
})
