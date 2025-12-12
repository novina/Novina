import { createClient } from "@/lib/supabase/server"
import { NovinaMascot } from "@/components/novina-mascot"
import { SeedContentButton } from "@/components/admin/seed-content-button"
import Link from "next/link"
import { FileText, Paintbrush, Globe, Link2, TrendingUp, Clock } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const [articlesRes, illustrationsRes, linksRes, scrapedRes] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact" }),
    supabase.from("illustrations").select("id", { count: "exact" }),
    supabase.from("links").select("id", { count: "exact" }),
    supabase.from("scraped_content").select("id", { count: "exact" }).eq("is_processed", false),
  ])

  const stats = [
    { label: "Članci", count: articlesRes.count || 0, icon: FileText, href: "/admin/articles", color: "bg-primary" },
    {
      label: "Ilustracije",
      count: illustrationsRes.count || 0,
      icon: Paintbrush,
      href: "/admin/illustrations",
      color: "bg-novina-teal",
    },
    { label: "Linkovi", count: linksRes.count || 0, icon: Link2, href: "/admin/links", color: "bg-novina-yellow" },
    {
      label: "Za obraditi",
      count: scrapedRes.count || 0,
      icon: Globe,
      href: "/admin/scraper",
      color: "bg-novina-mint",
    },
  ]

  // Get recent articles
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("id, title, slug, article_type, created_at, is_published")
    .order("created_at", { ascending: false })
    .limit(5)

  const hasContent = (articlesRes.count || 0) > 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">// upravljačka ploča redakcije</p>
        </div>
        <NovinaMascot mood="default" size="lg" />
      </div>

      {/* Seed Content Banner - Show only when no content */}
      {!hasContent && (
        <div className="brutalist-border brutalist-shadow p-6 bg-accent/20">
          <div className="flex items-center gap-4">
            <NovinaMascot mood="curious" size="lg" />
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Baza je prazna!</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Klikni gumb da kreiraš početne članke, linkove i šale za demonstraciju.
              </p>
              <SeedContentButton />
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="brutalist-border brutalist-shadow brutalist-hover p-6 bg-card"
            >
              <div className={`w-10 h-10 ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-3xl font-black">{stat.count}</p>
              <p className="text-sm text-muted-foreground font-mono">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="brutalist-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-xl font-bold">Nedavni članci</h2>
          </div>

          {recentArticles && recentArticles.length > 0 ? (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="truncate">
                    <p className="font-medium truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{article.article_type}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 ${article.is_published ? "bg-novina-mint" : "bg-muted"}`}>
                    {article.is_published ? "Objavljeno" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nema članaka. Kreiraj prvi!</p>
          )}
        </div>

        {/* Daily Tip */}
        <div className="brutalist-border bg-accent/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-bold">Savjet dana</h2>
          </div>

          <div className="flex gap-4">
            <NovinaMascot mood="think" size="lg" />
            <div>
              <p className="text-sm leading-relaxed">
                Koristi <strong>AI Agent</strong> za generiranje ilustracija koje prate tvoje članke. Fal AI može
                stvoriti unikatne vizuale u sekundi!
              </p>
              <Link href="/admin/ai-agent" className="inline-block mt-3 text-sm font-bold text-primary hover:underline">
                Isprobaj AI Agent →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fun Element - Random Joke */}
      <div className="brutalist-border brutalist-shadow p-4 bg-primary/5 text-center">
        <p className="font-mono text-sm">
          <span className="text-primary">$</span> echo &quot;Zašto AI urednik nikad ne kasni? Jer uvijek ima{" "}
          <em>prompt</em> odgovor!&quot;
        </p>
      </div>
    </div>
  )
}
