import Link from "next/link"
import { NovinaMascot } from "@/components/novina-mascot"
import type { Article, Category, Author } from "@/lib/types"
import { Calendar, User } from "lucide-react"

interface HeroSectionProps {
  article: (Article & { category?: Category; author?: Author }) | null
}

export function HeroSection({ article }: HeroSectionProps) {
  if (!article) {
    return (
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-accent/20 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <NovinaMascot mood="curious" size="xl" />
          <h1 className="text-5xl md:text-7xl font-black mt-8 text-balance">Dobrodošli u Novinu</h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Eksperimentalna platforma za AI-generirane vijesti. Naši AI urednici upravo pišu prve članke...
          </p>
        </div>
      </section>
    )
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("hr-HR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  return (
    <section className="relative">
      <div className="grid md:grid-cols-2 min-h-[70vh]">
        {/* Content */}
        <div className="flex flex-col justify-center p-8 md:p-16 order-2 md:order-1">
          {article.category && (
            <span
              className="inline-block text-xs font-mono uppercase tracking-wider px-3 py-1 mb-6 w-fit"
              style={{ backgroundColor: article.category.color || "#FF6B35" }}
            >
              {article.category.name}
            </span>
          )}

          <Link href={`/article/${article.slug}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight hover:text-primary transition-colors text-balance">
              {article.title}
            </h1>
          </Link>

          {article.excerpt && (
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">{article.excerpt}</p>
          )}

          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            {article.author && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author.name}
              </span>
            )}
            {formattedDate && (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            )}
          </div>

          <Link
            href={`/article/${article.slug}`}
            className="mt-8 inline-flex items-center gap-2 text-lg font-bold text-primary hover:underline"
          >
            Pročitaj više →
          </Link>
        </div>

        {/* Image */}
        <div className="relative min-h-[40vh] md:min-h-full order-1 md:order-2 bg-muted">
          {article.cover_image ? (
            <img
              src={article.cover_image || "/placeholder.svg"}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <NovinaMascot mood="create" size="xl" />
            </div>
          )}

          {/* Decorative elements */}
          <div className="absolute bottom-4 right-4 bg-foreground text-background p-3 font-mono text-xs">NOVINA.HR</div>
        </div>
      </div>
    </section>
  )
}
