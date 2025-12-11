import { createClient } from "@/lib/supabase/server"
import { ArticleEditor } from "@/components/admin/article-editor"
import { notFound } from "next/navigation"

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const isNew = id === "new"

  const [articleRes, categoriesRes, authorsRes, tweetsRes, tagsRes] = await Promise.all([
    isNew ? Promise.resolve({ data: null, error: null }) : supabase.from("articles").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("authors").select("*").order("name"),
    isNew ? Promise.resolve({ data: [], error: null }) : supabase.from("tweet_embeds").select("*").eq("article_id", id),
    isNew
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("article_tags").select("tag_id").eq("article_id", id),
  ])

  if (!isNew && (articleRes.error || !articleRes.data)) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-black">{isNew ? "Novi članak" : "Uredi članak"}</h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          {isNew ? "// kreiraj nešto novo" : `// ${articleRes.data?.slug}`}
        </p>
      </div>

      <ArticleEditor
        article={isNew ? null : articleRes.data}
        categories={categoriesRes.data || []}
        authors={authorsRes.data || []}
        existingTweets={tweetsRes.data || []}
        existingTagIds={tagsRes.data?.map((t: any) => t.tag_id) || []}
      />
    </div>
  )
}
