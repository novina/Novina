import { createClient } from "@/lib/supabase/server"
import { TweetManager } from "@/components/admin/tweet-manager"
import { TweetRoastManager } from "@/components/admin/tweet-roast-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        <p className="text-muted-foreground font-mono text-sm mt-1">// tweetovi i AI roast komentari</p>
      </div>

      <Tabs defaultValue="roast" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roast">🔥 Tweet Roast</TabsTrigger>
          <TabsTrigger value="embed">📎 Article Embeds</TabsTrigger>
        </TabsList>

        <TabsContent value="roast" className="mt-6">
          <TweetRoastManager />
        </TabsContent>

        <TabsContent value="embed" className="mt-6">
          <TweetManager tweets={tweets || []} articles={articles || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
