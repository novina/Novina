import Link from "next/link"
import { NovinaMascot } from "@/components/novina-mascot"
import { TweetEmbed } from "./tweet-embed"
import type { Article, Category, Author, Illustration, TweetEmbed as TweetEmbedType } from "@/lib/types"
import { Calendar, ArrowLeft, Share2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ArticleContentProps {
  article: Article & {
    category?: Category
    author?: Author
    illustrations?: Illustration[]
    tweet_embeds?: TweetEmbedType[]
  }
  relatedArticles: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    cover_image: string | null
    published_at: string | null
  }[]
}

export function ArticleContent({ article, relatedArticles }: ArticleContentProps) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("hr-HR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : ""

  // Get mascot mood based on category
  const getMascotMood = () => {
    switch (article.category?.icon) {
      case "alert":
        return "alert" as const
      case "think":
        return "think" as const
      case "create":
        return "create" as const
      case "experiment":
        return "experiment" as const
      case "future":
        return "future" as const
      default:
        return "default" as const
    }
  }

  // Get author avatar based on type
  const getAuthorAvatar = () => {
    switch (article.author?.type) {
      case "grok":
        return "G"
      case "claude":
        return "C"
      case "gemini":
        return "G"
      case "chatgpt":
        return "O"
      default:
        return "U"
    }
  }

  return (
    <article className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Natrag na naslovnicu
      </Link>

      {/* Header */}
      <header className="mb-12">
        {article.category && (
          <span
            className="inline-block text-xs font-mono uppercase tracking-wider px-3 py-1 mb-6"
            style={{ backgroundColor: article.category.color || "#FF6B35" }}
          >
            {article.category.name}
          </span>
        )}

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-balance">{article.title}</h1>

        {article.excerpt && <p className="mt-6 text-xl text-muted-foreground leading-relaxed">{article.excerpt}</p>}

        {/* Meta */}
        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {article.author && (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: article.category?.color || "#FF6B35" }}
              >
                {getAuthorAvatar()}
              </div>
              <div>
                <p className="font-bold text-foreground">{article.author.name}</p>
                <p className="text-xs font-mono">{article.author.type}</p>
              </div>
            </div>
          )}

          {formattedDate && (
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          )}

          <button className="ml-auto flex items-center gap-2 hover:text-primary">
            <Share2 className="w-4 h-4" />
            Podijeli
          </button>
        </div>
      </header>

      {/* Cover Image */}
      {article.cover_image && (
        <div className="mb-12 brutalist-border brutalist-shadow overflow-hidden">
          <img
            src={article.cover_image || "/placeholder.svg"}
            alt={article.title}
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none prose-headings:font-black prose-a:text-primary prose-img:rounded-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </div>

      {/* AI Illustrations */}
      {article.illustrations && article.illustrations.length > 0 && (
        <div className="mt-12 space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <NovinaMascot mood="create" size="sm" />
            AI Ilustracije
          </h3>

          {article.illustrations.map((ill) => (
            <div key={ill.id} className="brutalist-border overflow-hidden">
              <img src={ill.image_url || "/placeholder.svg"} alt={ill.prompt} className="w-full" />
              <div className="p-4 bg-muted/50">
                <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Prompt</p>
                <p className="text-sm italic">&quot;{ill.prompt}&quot;</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tweet Embeds */}
      {article.tweet_embeds && article.tweet_embeds.length > 0 && (
        <div className="mt-12 space-y-6">
          <h3 className="text-xl font-bold">S Twittera/X</h3>
          {article.tweet_embeds.map((tweet) => (
            <TweetEmbed key={tweet.id} tweetUrl={tweet.tweet_url} />
          ))}
        </div>
      )}

      {/* Author Bio */}
      {article.author && (
        <div className="mt-16 p-8 brutalist-border bg-muted/30">
          <div className="flex items-start gap-4">
            <NovinaMascot mood={getMascotMood()} size="lg" />
            <div>
              <h4 className="font-bold text-lg">{article.author.name}</h4>
              <p className="text-sm font-mono text-muted-foreground mb-2">
                {article.author.type === "human" ? "Ljudski urednik" : "AI autor"}
              </p>
              {article.author.bio && <p className="text-muted-foreground">{article.author.bio}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-8">Povezani članci</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/article/${related.slug}`}
                className="group brutalist-border brutalist-hover p-4 bg-card"
              >
                {related.cover_image && (
                  <img
                    src={related.cover_image || "/placeholder.svg"}
                    alt={related.title}
                    className="w-full aspect-video object-cover mb-4"
                  />
                )}
                <h4 className="font-bold group-hover:text-primary transition-colors text-balance">{related.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
