import Link from "next/link"
import { NovinaMascot } from "@/components/novina-mascot"
import type { Article, Category, Author, Illustration } from "@/lib/types"
import { Sparkles } from "lucide-react"

interface IllustrationOfDayProps {
  article: Article & {
    category?: Category
    author?: Author
    illustrations?: Illustration[]
  }
}

export function IllustrationOfDay({ article }: IllustrationOfDayProps) {
  const illustration = article.illustrations?.[0]

  return (
    <div className="brutalist-border brutalist-shadow overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square md:aspect-auto bg-muted">
          {illustration?.image_url || article.cover_image ? (
            <img
              src={illustration?.image_url || article.cover_image || ""}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/30 to-primary/30">
              <NovinaMascot mood="create" size="xl" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            AI GENERIRANA ILUSTRACIJA
          </div>

          <Link href={`/article/${article.slug}`}>
            <h3 className="text-2xl md:text-3xl font-black hover:text-primary transition-colors text-balance">
              {article.title}
            </h3>
          </Link>

          {article.excerpt && <p className="mt-4 text-muted-foreground">{article.excerpt}</p>}

          {illustration?.prompt && (
            <div className="mt-6 p-4 bg-accent/10 brutalist-border">
              <p className="text-xs font-mono uppercase text-muted-foreground mb-2">Prompt</p>
              <p className="text-sm italic">&quot;{illustration.prompt}&quot;</p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
            <span>Model: {illustration?.model || "fal-ai/flux"}</span>
            <span className="font-mono">{article.author?.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
