import { createClient } from "@/lib/supabase/server"
import { TweetManager } from "@/components/admin/tweet-manager"

export default async function TweetsPage() {
  const supabase = await createClient()

  const { data: tweets } = await supabase
    .from("tweet_embeds")
    .select("*, article:articles(id, title, slug)")
    .order("created_at", { ascending: false })

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug")
    .order("created_at", { ascending: false })
    .limit(30)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-black">Twitter/X</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">// upravljaj tweet embedovima</p>
      </div>

      <TweetManager tweets={tweets || []} articles={articles || []} />
    </div>
  )
}
