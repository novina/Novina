import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Eye } from "lucide-react"
import type { Article } from "@/lib/types"

export default async function ArticlesPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from("articles")
    .select(`
      *,
      category:categories(name, color),
      author:authors(name, type)
    `)
    .order("created_at", { ascending: false })

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      short_news: "Kratka vijest",
      topic_of_day: "Tema dana",
      illustration_of_day: "Ilustracija dana",
      feature: "Feature",
    }
    return labels[type] || type
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Članci</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">// svi članci u bazi</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Novi članak
          </Button>
        </Link>
      </div>

      {/* Articles Table */}
      <div className="brutalist-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b-3 border-foreground">
            <tr>
              <th className="text-left p-4 font-mono text-sm uppercase">Naslov</th>
              <th className="text-left p-4 font-mono text-sm uppercase">Tip</th>
              <th className="text-left p-4 font-mono text-sm uppercase">Kategorija</th>
              <th className="text-left p-4 font-mono text-sm uppercase">Autor</th>
              <th className="text-left p-4 font-mono text-sm uppercase">Status</th>
              <th className="text-right p-4 font-mono text-sm uppercase">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {articles && articles.length > 0 ? (
              articles.map(
                (
                  article: Article & {
                    category?: { name: string; color: string }
                    author?: { name: string; type: string }
                  },
                ) => (
                  <tr key={article.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <p className="font-medium truncate max-w-xs">{article.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">/{article.slug}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono bg-muted px-2 py-1">{getTypeLabel(article.article_type)}</span>
                    </td>
                    <td className="p-4">
                      {article.category && (
                        <span
                          className="text-xs font-mono px-2 py-1"
                          style={{ backgroundColor: article.category.color || "#ccc" }}
                        >
                          {article.category.name}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm">{article.author?.name || "-"}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-mono px-2 py-1 ${
                          article.is_published ? "bg-novina-mint" : "bg-muted"
                        }`}
                      >
                        {article.is_published ? "Objavljeno" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/articles/${article.id}`}>
                          <Button variant="ghost" size="icon" title="Uredi">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {article.is_published && (
                          <Link href={`/article/${article.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" title="Pregledaj">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  Nema članaka. Kreiraj prvi članak!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
