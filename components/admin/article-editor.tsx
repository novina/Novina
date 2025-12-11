"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { TweetEmbedInput } from "./tweet-embed-input"
import { ImageUploader } from "./image-uploader"
import { TagSelector } from "./tag-selector"
import { toast } from "sonner"
import type { Article, Category, Author, TweetEmbed } from "@/lib/types"
import { Save, Eye } from "lucide-react"

interface ArticleEditorProps {
  article?: Article
  categories: Category[]
  authors: Author[]
  existingTweets?: TweetEmbed[]
  existingTagIds?: string[]
}

export function ArticleEditor({
  article,
  categories,
  authors,
  existingTweets = [],
  existingTagIds = [],
}: ArticleEditorProps) {
  const router = useRouter()
  const isEditing = !!article

  const [formData, setFormData] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    content: article?.content || "",
    excerpt: article?.excerpt || "",
    cover_image: article?.cover_image || "",
    category_id: article?.category_id || "",
    author_id: article?.author_id || "",
    article_type: article?.article_type || "short_news",
    is_published: article?.is_published || false,
    is_featured: article?.is_featured || false,
  })

  const [tweets, setTweets] = useState<string[]>(existingTweets.map((t) => t.tweet_url))
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(existingTagIds)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/č/g, "c")
      .replace(/ć/g, "c")
      .replace(/đ/g, "d")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }))
  }

  const handleSubmit = async (publish = false) => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nisi prijavljen")

      const articleData = {
        ...formData,
        is_published: publish ? true : formData.is_published,
        published_at: publish ? new Date().toISOString() : article?.published_at,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      let articleId = article?.id

      if (isEditing) {
        const { error } = await supabase.from("articles").update(articleData).eq("id", article.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase.from("articles").insert(articleData).select("id").single()

        if (error) throw error
        articleId = data.id
      }

      if (articleId) {
        await supabase.from("article_tags").delete().eq("article_id", articleId)

        if (selectedTagIds.length > 0) {
          const tagData = selectedTagIds.map((tag_id) => ({
            article_id: articleId,
            tag_id,
          }))

          await supabase.from("article_tags").insert(tagData)
        }
      }

      // Handle tweet embeds
      if (articleId && tweets.length > 0) {
        await supabase.from("tweet_embeds").delete().eq("article_id", articleId)

        const tweetData = tweets
          .filter((t) => t)
          .map((tweet_url) => ({
            article_id: articleId,
            tweet_url,
            tweet_id: extractTweetId(tweet_url),
            user_id: user.id,
          }))

        if (tweetData.length > 0) {
          await supabase.from("tweet_embeds").insert(tweetData)
        }
      }

      toast.success(isEditing ? "Članak ažuriran!" : "Članak kreiran!")
      router.push("/admin/articles")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Greška pri spremanju")
    } finally {
      setIsLoading(false)
    }
  }

  const extractTweetId = (url: string) => {
    const match = url.match(/status\/(\d+)/)
    return match ? match[1] : ""
  }

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="brutalist-border bg-card p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="font-mono text-sm uppercase">
            Naslov *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Unesi naslov članka"
            className="brutalist-border text-xl font-bold"
            required
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="font-mono text-sm uppercase">
            URL Slug *
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono">/article/</span>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="url-slug"
              className="brutalist-border font-mono"
              required
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="font-mono text-sm uppercase">
            Sažetak
          </Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Kratki sažetak za prikaz u listi..."
            className="brutalist-border"
            rows={2}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="font-mono text-sm uppercase">
            Sadržaj *
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Piši članak ovdje... Podržava Markdown."
            className="brutalist-border font-mono text-sm"
            rows={15}
            required
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label className="font-mono text-sm uppercase">Naslovna slika</Label>
          <ImageUploader
            value={formData.cover_image}
            onChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url }))}
          />
        </div>

        {/* Tags */}
        <TagSelector selectedTags={selectedTagIds} onChange={setSelectedTagIds} />

        {/* Tweet Embeds */}
        <TweetEmbedInput tweets={tweets} onChange={setTweets} />
      </div>

      {/* Sidebar Options */}
      <div className="brutalist-border bg-card p-6 space-y-6">
        <h3 className="font-bold text-lg">Postavke članka</h3>

        {/* Article Type */}
        <div className="space-y-2">
          <Label className="font-mono text-sm uppercase">Tip članka</Label>
          <Select
            value={formData.article_type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, article_type: value as Article["article_type"] }))
            }
          >
            <SelectTrigger className="brutalist-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_news">Kratka vijest</SelectItem>
              <SelectItem value="topic_of_day">Tema dana</SelectItem>
              <SelectItem value="illustration_of_day">Ilustracija dana</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="font-mono text-sm uppercase">Kategorija</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger className="brutalist-border">
              <SelectValue placeholder="Odaberi kategoriju" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label className="font-mono text-sm uppercase">Autor</Label>
          <Select
            value={formData.author_id}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, author_id: value }))}
          >
            <SelectTrigger className="brutalist-border">
              <SelectValue placeholder="Odaberi autora" />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name} ({author.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured */}
        <div className="flex items-center justify-between">
          <Label className="font-mono text-sm uppercase">Istaknuto</Label>
          <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()} className="brutalist-border">
          Odustani
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="brutalist-border gap-2"
          >
            <Save className="w-4 h-4" />
            Spremi draft
          </Button>

          <Button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground gap-2"
          >
            <Eye className="w-4 h-4" />
            {isLoading ? "Spremanje..." : "Objavi"}
          </Button>
        </div>
      </div>
    </div>
  )
}
