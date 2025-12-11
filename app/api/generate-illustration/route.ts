import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { createClient } from "@/lib/supabase/server"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, articleId, style = "default" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Enhance prompt based on style
    const stylePrompts: Record<string, string> = {
      default: "digital illustration, modern, clean, professional",
      brutalist: "brutalist design, bold shapes, high contrast, geometric, editorial illustration",
      retro: "retro futurism, 80s aesthetic, neon colors, synthwave",
      minimal: "minimalist illustration, simple shapes, limited color palette, clean lines",
      editorial: "editorial illustration, newspaper style, woodcut print, dramatic shadows",
      surreal: "surrealist art, dreamlike, imaginative, Salvador Dali inspired",
    }

    const enhancedPrompt = `${prompt}. Style: ${stylePrompts[style] || stylePrompts.default}. High quality, 4K resolution.`

    // Generate image using fal
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        num_images: 1,
      },
    })

    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    // Optionally save to database
    if (articleId) {
      await supabase.from("illustrations").insert({
        article_id: articleId,
        prompt,
        image_url: imageUrl,
        model: "fal-ai/flux/schnell",
        user_id: user.id,
      })
    }

    return NextResponse.json({
      imageUrl,
      prompt: enhancedPrompt,
    })
  } catch (error) {
    console.error("Error generating illustration:", error)
    return NextResponse.json({ error: "Failed to generate illustration" }, { status: 500 })
  }
}
