import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { OpenRouterClient } from "@/lib/ai-providers/openrouter"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { type = "manual", provider_id, topic_id, custom_instructions } = body

        if (!provider_id || !topic_id) {
            return NextResponse.json({ error: "Provider and topic required" }, { status: 400 })
        }

        const [providerRes, topicRes] = await Promise.all([
            supabase.from("ai_providers").select("*").eq("id", provider_id).single(),
            supabase.from("news_topics").select("*").eq("id", topic_id).single(),
        ])

        if (providerRes.error || !providerRes.data) {
            return NextResponse.json({ error: "Provider not found" }, { status: 404 })
        }

        if (topicRes.error || !topicRes.data) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 })
        }

        const provider = providerRes.data
        const topic = topicRes.data

        const { data: batch, error: batchError } = await supabase
            .from("news_batches")
            .insert({
                batch_date: new Date().toISOString().split("T")[0],
                generation_type: type,
                status: "pending",
                user_id: user.id,
                provider_id: provider.id,
                topic_id: topic.id,
            })
            .select()
            .single()

        if (batchError || !batch) {
            return NextResponse.json({ error: "Failed to create batch", details: batchError }, { status: 500 })
        }

        await supabase.from("news_batches").update({ status: "processing" }).eq("id", batch.id)

        try {
            // Build enhanced prompt with topic context
            const today = new Date().toLocaleDateString("hr-HR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            })

            const enhancedPrompt = `
# ZADATAK: Napiši kratku vijest

## TEMA: ${topic.name}
${topic.description ? `Opis teme: ${topic.description}` : ""}

## DANAŠNJI DATUM: ${today}

## UPUTE:
${topic.prompt_template}

${custom_instructions ? `## DODATNE NAPOMENE UREDNIKA:\n${custom_instructions}` : ""}

## KRITIČNE NAPOMENE:
1. Vijest MORA biti na HRVATSKOM jeziku
2. Vijest MORA biti o temi "${topic.name}" - NE piši o ničem drugom!
3. Sadržaj mora biti profesionalan i novinarski napisan
4. Koristi formalni ton prigodan za novinski portal
5. Dužina: 100-150 riječi

## FORMAT ODGOVORA (SAMO JSON, bez dodatnog teksta):
{
  "title": "Naslov vijesti (max 80 znakova, privlačan i informativan)",
  "excerpt": "Kratki sažetak u jednoj rečenici (max 150 znakova)",
  "content": "Puni tekst vijesti u Markdown formatu. Uključi uvod, srednji dio s detaljima, i zaključak."
}
`.trim()

            const client = new OpenRouterClient(provider.model_id)
            const article = await client.generateNews(enhancedPrompt)

            const { data: author } = await supabase
                .from("authors")
                .select("id")
                .eq("type", provider.name)
                .single()

            const { data: category } = await supabase
                .from("categories")
                .select("id")
                .eq("slug", "kratke-vijesti")
                .single()

            const timestamp = Date.now()
            const slug = article.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
                .substring(0, 50) + `-${timestamp}`

            const { data: newArticle, error: articleError } = await supabase
                .from("articles")
                .insert({
                    title: article.title,
                    slug,
                    content: article.content,
                    excerpt: article.excerpt,
                    article_type: "short_news",
                    author_id: author?.id || null,
                    category_id: category?.id || null,
                    is_published: true,
                    published_at: new Date().toISOString(),
                    user_id: user.id,
                    batch_id: batch.id,
                })
                .select()
                .single()

            if (articleError) {
                throw new Error(`Failed to save article: ${articleError.message}`)
            }

            await supabase
                .from("news_batches")
                .update({
                    status: "completed",
                    articles_generated: 1,
                    completed_at: new Date().toISOString(),
                })
                .eq("id", batch.id)

            // Return full article data for preview
            return NextResponse.json({
                success: true,
                batchId: batch.id,
                articleId: newArticle.id,
                articleSlug: newArticle.slug,
                article: {
                    id: newArticle.id,
                    title: article.title,
                    excerpt: article.excerpt,
                    content: article.content,
                    slug: newArticle.slug,
                    published_at: newArticle.published_at,
                },
                topic: {
                    name: topic.name,
                    color: topic.color,
                },
                provider: {
                    name: provider.display_name,
                },
            })
        } catch (genError) {
            await supabase
                .from("news_batches")
                .update({
                    status: "failed",
                    error_message: genError instanceof Error ? genError.message : "Unknown error",
                    completed_at: new Date().toISOString(),
                })
                .eq("id", batch.id)

            throw genError
        }
    } catch (error) {
        console.error("News generation error:", error)
        return NextResponse.json(
            {
                error: "Failed to generate news",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
