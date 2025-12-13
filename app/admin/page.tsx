import { createClient } from "@/lib/supabase/server"
import { NovinaMascot } from "@/components/novina-mascot"
import { SeedContentButton } from "@/components/admin/seed-content-button"
import Link from "next/link"
import { FileText, Paintbrush, Globe, Link2, TrendingUp, Clock, MessageCircle } from "lucide-react"

// X logo SVG component
function XLogo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

interface ContentItem {
  id: string
  type: "article" | "tweet" | "quote" | "link"
  title: string
  created_at: string
  is_published?: boolean
  href: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats for all content types
  const [articlesRes, illustrationsRes, linksRes, scrapedRes, tweetsRes, quotesRes] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact" }),
    supabase.from("illustrations").select("id", { count: "exact" }),
    supabase.from("links").select("id", { count: "exact" }),
    supabase.from("scraped_content").select("id", { count: "exact" }).eq("is_processed", false),
    supabase.from("standalone_tweets").select("id", { count: "exact" }),
    supabase.from("funny_quotes").select("id", { count: "exact" }),
  ])

  const stats = [
    { label: "Članci", count: articlesRes.count || 0, icon: FileText, href: "/admin/articles", color: "bg-primary" },
    {
      label: "X Postovi",
      count: tweetsRes.count || 0,
      icon: () => <XLogo className="w-5 h-5 text-primary-foreground" />,
      href: "/admin/tweets",
      color: "bg-foreground",
    },
    {
      label: "Ilustracije",
      count: illustrationsRes.count || 0,
      icon: Paintbrush,
      href: "/admin/illustrations",
      color: "bg-novina-teal",
    },
    { label: "Linkovi", count: linksRes.count || 0, icon: Link2, href: "/admin/links", color: "bg-novina-yellow" },
    {
      label: "Šale",
      count: quotesRes.count || 0,
      icon: MessageCircle,
      href: "/admin/quotes",
      color: "bg-novina-coral",
    },
    {
      label: "Za obraditi",
      count: scrapedRes.count || 0,
      icon: Globe,
      href: "/admin/scraper",
      color: "bg-novina-mint",
    },
  ]

  // Get recent content from all sources
  const [recentArticles, recentTweets, recentLinks] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, created_at, is_published")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("standalone_tweets")
      .select("id, tweet_content, created_at, is_published")
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("links")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(2),
  ])

  // Combine and sort recent content
  const recentContent: ContentItem[] = [
    ...(recentArticles.data || []).map((a) => ({
      id: a.id,
      type: "article" as const,
      title: a.title,
      created_at: a.created_at,
      is_published: a.is_published,
      href: `/admin/articles/${a.id}`,
    })),
    ...(recentTweets.data || []).map((t) => ({
      id: t.id,
      type: "tweet" as const,
      title: t.tweet_content?.substring(0, 50) + "..." || "X Post",
      created_at: t.created_at,
      is_published: t.is_published,
      href: "/admin/tweets",
    })),
    ...(recentLinks.data || []).map((l) => ({
      id: l.id,
      type: "link" as const,
      title: l.title,
      created_at: l.created_at,
      is_published: true,
      href: "/admin/links",
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

  const hasContent = (articlesRes.count || 0) > 0

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "article": return "Članak"
      case "tweet": return "X Post"
      case "link": return "Link"
      case "quote": return "Šala"
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article": return "bg-primary/20 text-primary"
      case "tweet": return "bg-foreground/20 text-foreground"
      case "link": return "bg-novina-yellow/50"
      case "quote": return "bg-novina-coral/20"
      default: return "bg-muted"
    }
  }

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="brutalist-border brutalist-shadow brutalist-hover p-4 bg-card"
            >
              <div className={`w-10 h-10 ${stat.color} flex items-center justify-center mb-3`}>
                {typeof Icon === "function" ? <Icon /> : <Icon className="w-5 h-5 text-primary-foreground" />}
              </div>
              <p className="text-2xl font-black">{stat.count}</p>
              <p className="text-xs text-muted-foreground font-mono">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Content */}
        <div className="brutalist-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-xl font-bold">Nedavni sadržaj</h2>
          </div>

          {recentContent.length > 0 ? (
            <div className="space-y-3">
              {recentContent.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="truncate flex-1">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className={`text-xs font-mono px-2 py-0.5 inline-block mt-1 ${getTypeColor(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </p>
                  </div>
                  {item.is_published !== undefined && (
                    <span className={`text-xs px-2 py-1 ml-2 ${item.is_published ? "bg-novina-mint" : "bg-muted"}`}>
                      {item.is_published ? "Objavljeno" : "Draft"}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nema sadržaja. Kreiraj prvi!</p>
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
