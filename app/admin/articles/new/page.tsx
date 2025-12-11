import { createClient } from "@/lib/supabase/server"
import { ArticleEditor } from "@/components/admin/article-editor"

export default async function NewArticlePage() {
  const supabase = await createClient()

  const [categoriesRes, authorsRes] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("authors").select("*").order("name"),
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-black">Novi članak</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">// kreiraj novu vijest</p>
      </div>

      <ArticleEditor categories={categoriesRes.data || []} authors={authorsRes.data || []} />
    </div>
  )
}
