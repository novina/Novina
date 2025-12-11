import { createClient } from "@/lib/supabase/server"
import { IllustrationGallery } from "@/components/admin/illustration-gallery"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wand2 } from "lucide-react"

export default async function IllustrationsPage() {
  const supabase = await createClient()

  const { data: illustrations } = await supabase
    .from("illustrations")
    .select("*, article:articles(id, title, slug)")
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Ilustracije</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">// sve AI-generirane ilustracije</p>
        </div>
        <Link href="/admin/ai-agent">
          <Button className="brutalist-border brutalist-shadow brutalist-hover bg-accent text-accent-foreground gap-2">
            <Wand2 className="w-4 h-4" />
            Nova ilustracija
          </Button>
        </Link>
      </div>

      <IllustrationGallery illustrations={illustrations || []} />
    </div>
  )
}
