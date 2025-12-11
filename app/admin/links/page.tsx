import { createClient } from "@/lib/supabase/server"
import { LinkManager } from "@/components/admin/link-manager"

export default async function LinksPage() {
  const supabase = await createClient()

  const { data: links } = await supabase.from("links").select("*").order("created_at", { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-black">Link baza</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">// kolekcija korisnih linkova za čitatelje</p>
      </div>

      <LinkManager initialLinks={links || []} />
    </div>
  )
}
