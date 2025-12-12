import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Available models for roasting
export const ROAST_MODELS = [
    { id: "google/gemini-2.5-flash", name: "Gemini", icon: "✨" },
    { id: "anthropic/claude-3.5-sonnet", name: "Claude", icon: "🎭" },
    { id: "openai/gpt-4o", name: "ChatGPT", icon: "🤖" },
    { id: "x-ai/grok-2", name: "Grok", icon: "🔥" },
    { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama", icon: "🦙" },
]

const ROAST_PROMPT = `Ti si duhoviti AI komentator na društvenim mrežama. Tvoj zadatak je napisati kratak, duhovit komentar ili "roast" na sljedeći tweet.

Tweet:
"{tweetContent}"

Pravila:
- Budi duhovit ali ne uvredljiv
- Maksimalno 2-3 rečenice
- Koristi humor, ironiju ili pametne opservacije
- Piši na hrvatskom jeziku
- Ne koristi hashtage

Napiši SAMO svoj komentar, bez navodnika ili dodatnih objašnjenja.`

async function generateRoast(
    modelId: string,
    tweetContent: string,
    apiKey: string
): Promise<string> {
    const prompt = ROAST_PROMPT.replace("{tweetContent}", tweetContent)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Novina News Platform",
        },
        body: JSON.stringify({
            model: modelId,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 256,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
        throw new Error("No content in response")
    }

    return content.trim()
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { tweetId, tweetContent, models } = await request.json()

        if (!tweetId || !tweetContent || !models || models.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields: tweetId, tweetContent, models" },
                { status: 400 }
            )
        }

        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "OpenRouter API key not configured" },
                { status: 500 }
            )
        }

        // Generate roasts from all selected models in parallel
        const roastPromises = models.map(async (modelId: string) => {
            const modelInfo = ROAST_MODELS.find((m) => m.id === modelId)
            if (!modelInfo) return null

            try {
                const roastText = await generateRoast(modelId, tweetContent, apiKey)
                return {
                    model_id: modelId,
                    model_name: modelInfo.name,
                    roast_text: roastText,
                    roast_type: "roast",
                }
            } catch (error) {
                console.error(`Roast generation failed for ${modelId}:`, error)
                return {
                    model_id: modelId,
                    model_name: modelInfo.name,
                    roast_text: `[Greška pri generiranju]`,
                    roast_type: "roast",
                    error: true,
                }
            }
        })

        const roasts = (await Promise.all(roastPromises)).filter(Boolean)

        // Save roasts to database
        const roastsToInsert = roasts
            .filter((r) => r && !r.error)
            .map((r) => ({
                tweet_id: tweetId,
                model_id: r!.model_id,
                model_name: r!.model_name,
                roast_text: r!.roast_text,
                roast_type: r!.roast_type,
            }))

        if (roastsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from("tweet_roasts")
                .insert(roastsToInsert)

            if (insertError) {
                console.error("Failed to save roasts:", insertError)
            }
        }

        return NextResponse.json({
            success: true,
            roasts: roasts,
            saved: roastsToInsert.length,
        })
    } catch (error) {
        console.error("Roast generation error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}

// GET available models
export async function GET() {
    return NextResponse.json({ models: ROAST_MODELS })
}
