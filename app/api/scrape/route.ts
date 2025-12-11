import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const { url, selector } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NovinaBot/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Basic parsing - extract title and text content
    // In production, you'd use a proper HTML parser
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : "Untitled"

    // Extract main content (simplified)
    // Remove scripts, styles, and HTML tags
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000) // Limit content length

    // If selector provided, try to extract specific content
    if (selector) {
      // This is a simplified approach - in production use cheerio or similar
      const selectorRegex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, "gi")
      const matches = html.match(selectorRegex)
      if (matches) {
        content = matches
          .map((m) =>
            m
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim(),
          )
          .join("\n\n")
      }
    }

    return NextResponse.json({
      title,
      content,
      url,
      scrapedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Scraping error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to scrape" }, { status: 500 })
  }
}
