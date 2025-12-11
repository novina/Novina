import { getCategoryBySlug, getArticlesByCategory } from "@/lib/queries"
import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { ShortNewsGrid } from "@/components/public/short-news-grid"
import { NovinaMascot } from "@/components/novina-mascot"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  // Cacheirano - isti poziv u page funkciji neće ponovo fetchati
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: "Kategorija nije pronađena - Novina" }
  }

  return {
    title: `${category.name} - Novina`,
    description: category.description || undefined,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  // Cacheirano - koristi isti response kao generateMetadata (React cache)
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // Dohvati članke za kategoriju
  const articles = await getArticlesByCategory(category.id)

  // Get mascot mood based on category icon
  const getMascotMood = () => {
    switch (category.icon) {
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

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-6 mb-12">
            <NovinaMascot mood={getMascotMood()} size="xl" />
            <div>
              <div
                className="inline-block text-xs font-mono uppercase tracking-wider px-3 py-1 mb-3"
                style={{ backgroundColor: category.color || "#FF6B35" }}
              >
                Rubrika
              </div>
              <h1 className="text-4xl md:text-5xl font-black">{category.name}</h1>
              {category.description && <p className="mt-3 text-lg text-muted-foreground">{category.description}</p>}
            </div>
          </div>

          {/* Articles Grid */}
          <ShortNewsGrid articles={articles} />

          {articles.length === 0 && (
            <div className="brutalist-border p-12 text-center bg-muted/30">
              <NovinaMascot mood="curious" size="lg" />
              <p className="mt-4 text-muted-foreground">Još nema članaka u ovoj rubrici. AI urednici marljivo rade!</p>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
