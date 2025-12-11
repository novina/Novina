import { createClient } from "@/lib/supabase/server"
import { AIAgentInterface } from "@/components/admin/ai-agent-interface"

export default async function AIAgentPage() {
  const supabase = await createClient()

  // Get recent illustrations
  const { data: recentIllustrations } = await supabase
    .from("illustrations")
    .select("*, article:articles(title, slug)")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get articles for linking
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black">AI Agent</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">// generiraj ilustracije s fal.ai</p>
      </div>

      <AIAgentInterface recentIllustrations={recentIllustrations || []} articles={articles || []} />
    </div>
  )
}
