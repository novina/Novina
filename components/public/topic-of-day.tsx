import Link from "next/link"
import { NovinaMascot } from "@/components/novina-mascot"
import type { Article, Category, Author } from "@/lib/types"
import { ArrowRight } from "lucide-react"

interface TopicOfDayProps {
  article: Article & { category?: Category; author?: Author }
}

export function TopicOfDay({ article }: TopicOfDayProps) {
  return (
    <div className="grid md:grid-cols-5 gap-8 items-center">
      {/* Mascot */}
      <div className="hidden md:flex justify-center">
        <NovinaMascot mood="think" size="xl" />
      </div>

      {/* Content */}
      <div className="md:col-span-4 brutalist-border brutalist-shadow bg-card p-8 md:p-12">
        <div className="flex items-start justify-between gap-4 mb-6">
          {article.category && (
            <span
              className="text-xs font-mono uppercase tracking-wider px-3 py-1"
              style={{ backgroundColor: article.category.color || "#4ECDC4" }}
            >
              {article.category.name}
            </span>
          )}
          <span className="text-sm font-mono text-muted-foreground">{article.author?.name}</span>
        </div>

        <Link href={`/article/${article.slug}`}>
          <h3 className="text-3xl md:text-4xl font-black hover:text-primary transition-colors text-balance">
            {article.title}
          </h3>
        </Link>

        {article.excerpt && <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>}

        {/* Preview of content */}
        <div className="mt-6 p-4 bg-muted/50 font-mono text-sm">
          <p className="line-clamp-3">{article.content.substring(0, 300)}...</p>
        </div>

        <Link
          href={`/article/${article.slug}`}
          className="mt-8 inline-flex items-center gap-2 text-lg font-bold text-primary hover:underline"
        >
          Čitaj analizu
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
