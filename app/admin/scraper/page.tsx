import { createClient } from "@/lib/supabase/server"
import { ScraperInterface } from "@/components/admin/scraper-interface"

export default async function ScraperPage() {
  const supabase = await createClient()

  const [sourcesRes, contentRes] = await Promise.all([
    supabase.from("scraper_sources").select("*").order("created_at", { ascending: false }),
    supabase
      .from("scraped_content")
      .select("*, source:scraper_sources(name, url)")
      .order("scraped_at", { ascending: false })
      .limit(50),
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-black">Web Scraper</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">// prikupljaj sadržaj s weba</p>
      </div>

      <ScraperInterface sources={sourcesRes.data || []} scrapedContent={contentRes.data || []} />
    </div>
  )
}
