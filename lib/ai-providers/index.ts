import { createClient } from "@/lib/supabase/server"
import { ClaudeProvider } from "./claude"
import { GeminiProvider } from "./gemini"
import { ChatGPTProvider } from "./chatgpt"
import { GrokProvider } from "./grok"
import type { AIProvider, AIProviderType } from "./types"

export interface GenerationResult {
    provider: AIProviderType
    success: boolean
    articleId?: string
    error?: string
}

export class NewsOrchestrator {
    private providers: Map<AIProviderType, AIProvider>

    constructor() {
        this.providers = new Map([
            ["claude", new ClaudeProvider()],
            ["gemini", new GeminiProvider()],
            ["chatgpt", new ChatGPTProvider()],
            ["grok", new GrokProvider()],
        ])
    }

    async generateAllNews(userId: string, batchId: string): Promise<GenerationResult[]> {
        const results: GenerationResult[] = []

        // Generate news from all providers in parallel
        const promises = Array.from(this.providers.entries()).map(async ([providerType, provider]) => {
            try {
                const article = await provider.generateNews()
                const articleId = await this.saveArticle(article, providerType, userId, batchId)

                return {
                    provider: providerType,
                    success: true,
                    articleId,
                }
            } catch (error) {
                console.error(`Failed to generate news from ${providerType}:`, error)
                return {
                    provider: providerType,
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                }
            }
        })

        const allResults = await Promise.allSettled(promises)

        allResults.forEach((result) => {
            if (result.status === "fulfilled") {
                results.push(result.value)
            } else {
                results.push({
                    provider: "claude", // fallback
                    success: false,
                    error: result.reason,
                })
            }
        })

        return results
    }

    private async saveArticle(
        article: { title: string; content: string; excerpt: string },
        providerType: AIProviderType,
        userId: string,
        batchId: string
    ): Promise<string> {
        const supabase = await createClient()

        // Get author ID for this AI provider
        const { data: author } = await supabase.from("authors").select("id").eq("type", providerType).single()

        if (!author) {
            throw new Error(`Author not found for ${providerType}`)
        }

        // Get the "Kratke vijesti" category
        const { data: category } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", "kratke-vijesti")
            .single()

        // Generate slug from title
        const slug = this.generateSlug(article.title, providerType)

        // Insert article
        const { data: newArticle, error } = await supabase
            .from("articles")
            .insert({
                title: article.title,
                slug,
                content: article.content,
                excerpt: article.excerpt,
                article_type: "short_news",
                author_id: author.id,
                category_id: category?.id || null,
                is_published: true,
                published_at: new Date().toISOString(),
                user_id: userId,
                batch_id: batchId,
            })
            .select("id")
            .single()

        if (error) {
            throw new Error(`Failed to save article: ${error.message}`)
        }

        return newArticle.id
    }

    private generateSlug(title: string, provider: AIProviderType): string {
        const timestamp = Date.now()
        const baseSlug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .substring(0, 50)

        return `${baseSlug}-${provider}-${timestamp}`
    }
}
