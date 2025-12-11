"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NovinaMascot } from "@/components/novina-mascot"
import { toast } from "sonner"
import type { TweetEmbed, Article } from "@/lib/types"
import { Twitter, Plus, Trash2, Link2, ExternalLink } from "lucide-react"

interface TweetManagerProps {
  tweets: (TweetEmbed & { article?: Pick<Article, "id" | "title" | "slug"> | null })[]
  articles: { id: string; title: string; slug: string }[]
}

export function TweetManager({ tweets: initialTweets, articles }: TweetManagerProps) {
  const [tweets, setTweets] = useState(initialTweets)
  const [newTweetUrl, setNewTweetUrl] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)

  const extractTweetId = (url: string) => {
    const match = url.match(/status\/(\d+)/)
    return match ? match[1] : ""
  }

  const isValidTweetUrl = (url: string) => {
    return (url.includes("twitter.com") || url.includes("x.com")) && extractTweetId(url)
  }

  const handleAdd = async () => {
    if (!newTweetUrl || !isValidTweetUrl(newTweetUrl)) {
      toast.error("Unesi validan Twitter/X URL")
      return
    }

    if (!selectedArticle) {
      toast.error("Odaberi članak za embed")
      return
    }

    const supabase = createClient()
    setIsAdding(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nisi prijavljen")

      const { data, error } = await supabase
        .from("tweet_embeds")
        .insert({
          article_id: selectedArticle,
          tweet_url: newTweetUrl,
          tweet_id: extractTweetId(newTweetUrl),
          user_id: user.id,
        })
        .select("*, article:articles(id, title, slug)")
        .single()

      if (error) throw error

      setTweets([data, ...tweets])
      setNewTweetUrl("")
      setSelectedArticle("")
      toast.success("Tweet dodan!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Greška")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("tweet_embeds").delete().eq("id", id)
      if (error) throw error

      setTweets(tweets.filter((t) => t.id !== id))
      toast.success("Tweet obrisan")
    } catch (error) {
      toast.error("Greška pri brisanju")
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Add */}
      <div className="brutalist-border brutalist-shadow bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <NovinaMascot mood="alert" size="md" />
          <div>
            <h2 className="text-xl font-bold">Dodaj tweet</h2>
            <p className="text-sm text-muted-foreground font-mono">// zalijepi link na tweet za embed</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-sm uppercase">Tweet URL</Label>
            <div className="flex items-center gap-2">
              <Twitter className="w-5 h-5 text-muted-foreground" />
              <Input
                value={newTweetUrl}
                onChange={(e) => setNewTweetUrl(e.target.value)}
                placeholder="https://twitter.com/user/status/123456..."
                className="brutalist-border font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-sm uppercase">Poveži s člankom</Label>
            <Select value={selectedArticle} onValueChange={setSelectedArticle}>
              <SelectTrigger className="brutalist-border">
                <SelectValue placeholder="Odaberi članak..." />
              </SelectTrigger>
              <SelectContent>
                {articles.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAdd}
            disabled={isAdding || !newTweetUrl || !selectedArticle}
            className="w-full brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? "Dodavanje..." : "Dodaj tweet"}
          </Button>
        </div>
      </div>

      {/* Tweets List */}
      <div className="brutalist-border bg-card p-6">
        <h2 className="text-xl font-bold mb-6">Svi embedovi ({tweets.length})</h2>

        {tweets.length > 0 ? (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="p-4 brutalist-border flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    <span className="font-mono text-sm">...{tweet.tweet_id.slice(-8)}</span>
                  </div>

                  {tweet.article && (
                    <div className="flex items-center gap-2 text-sm">
                      <Link2 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Povezan s:</span>
                      <a
                        href={`/article/${tweet.article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary flex items-center gap-1"
                      >
                        {tweet.article.title.substring(0, 40)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(tweet.created_at).toLocaleString("hr-HR")}</span>
                    <a
                      href={tweet.tweet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary flex items-center gap-1"
                    >
                      Otvori na X <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => handleDelete(tweet.id)} title="Obriši">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Twitter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nema tweet embedova</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="brutalist-border bg-accent/20 p-6">
        <h3 className="font-bold mb-3">Savjeti za Twitter/X</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Kopiraj link na tweet klikom na "Share" → "Copy link"</li>
          <li>• Podržani su i twitter.com i x.com linkovi</li>
          <li>• Tweet se automatski embedira u članku kojem ga dodijeliš</li>
          <li>• Možeš dodati više tweetova istom članku</li>
        </ul>
      </div>
    </div>
  )
}
