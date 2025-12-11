export interface NewsArticle {
    title: string
    content: string
    excerpt: string
}

export interface AIProvider {
    name: string
    generateNews(): Promise<NewsArticle>
}

export type AIProviderType = "claude" | "grok" | "gemini" | "chatgpt"
