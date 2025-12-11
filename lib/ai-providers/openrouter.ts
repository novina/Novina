import type { NewsArticle } from "./types"

interface OpenRouterResponse {
    choices: {
        message: {
            content: string
        }
    }[]
    error?: {
        message: string
        code?: string
    }
}

export class OpenRouterClient {
    private apiKey: string
    private model: string
    private siteUrl: string
    private siteName: string
    private timeout: number = 60000 // 60 seconds timeout

    constructor(model: string) {
        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY is not set")
        }
        this.apiKey = apiKey
        this.model = model
        this.siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        this.siteName = "Novina News Platform"
    }

    async generateNews(prompt: string): Promise<NewsArticle> {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        try {
            console.log(`[OpenRouter] Starting generation with model: ${this.model}`)

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "HTTP-Referer": this.siteUrl,
                    "X-Title": this.siteName,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 1024
                    // Note: response_format removed - not supported by all models on OpenRouter
                }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorText = await response.text()
                console.error(`[OpenRouter] API error ${response.status}:`, errorText)
                throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
            }

            const data = await response.json() as OpenRouterResponse

            // Check for error in response body
            if (data.error) {
                throw new Error(`OpenRouter error: ${data.error.message}`)
            }

            const content = data.choices?.[0]?.message?.content
            console.log(`[OpenRouter] Received response from ${this.model}:`, content?.substring(0, 100) + "...")

            if (!content) {
                throw new Error("No content in OpenRouter response")
            }

            // Extract JSON from response - models may wrap in markdown code blocks
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                content.match(/```\s*([\s\S]*?)\s*```/) ||
                content.match(/\{[\s\S]*\}/)

            const jsonString = jsonMatch
                ? (jsonMatch[1] || jsonMatch[0]).trim()
                : content.trim()

            try {
                const article = JSON.parse(jsonString)

                // Validate required fields
                if (!article.title || !article.content || !article.excerpt) {
                    console.error("[OpenRouter] Missing fields in parsed article:", article)
                    throw new Error("Missing required fields in generated article")
                }

                console.log(`[OpenRouter] Successfully generated article: "${article.title}"`)

                return {
                    title: article.title,
                    excerpt: article.excerpt,
                    content: article.content,
                }
            } catch (parseError) {
                console.error("[OpenRouter] Failed to parse JSON. Raw content:", content)
                throw new Error("Failed to parse JSON from AI response")
            }

        } catch (error) {
            clearTimeout(timeoutId)

            if (error instanceof Error && error.name === 'AbortError') {
                console.error(`[OpenRouter] Request timed out for model ${this.model}`)
                throw new Error(`Request timed out after ${this.timeout / 1000}s`)
            }

            console.error(`[OpenRouter] Generation failed for model ${this.model}:`, error)
            throw new Error(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    }
}

