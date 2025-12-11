import { getArticleBySlug, getRelatedArticles } from "@/lib/queries"
import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { ArticleContent } from "@/components/public/article-content"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  // Cacheirano - isti poziv u page funkciji neće ponovo fetchati
  const article = await getArticleBySlug(slug)

  if (!article) {
    return { title: "Članak nije pronađen - Novina" }
  }

  return {
    title: `${article.title} - Novina`,
    description: article.excerpt || undefined,
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  // Cacheirano - koristi isti response kao generateMetadata (React cache)
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // Paralelno dohvati related članke
  const relatedArticles = await getRelatedArticles(article.id, article.category_id, 3)

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <ArticleContent article={article} relatedArticles={relatedArticles} />
      <PublicFooter />
    </div>
  )
}
