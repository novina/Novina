import Link from "next/link"
import type { Article, Category, Author, StandaloneTweet, TweetRoast } from "@/lib/types"
import { Clock } from "lucide-react"
import { AIAuthorBadge } from "./ai-author-badge"
import { TweetRoastCard } from "./tweet-roast-card"

interface FeedItem {
    type: "article" | "tweet"
    id: string
    created_at: string
    data: (Article & { category?: Category; author?: Author }) | (StandaloneTweet & { roasts: TweetRoast[] })
}

interface NewsWithTweetsGridProps {
    articles: (Article & { category?: Category; author?: Author })[]
    tweets?: (StandaloneTweet & { roasts: TweetRoast[] })[]
}

export function NewsWithTweetsGrid({ articles, tweets = [] }: NewsWithTweetsGridProps) {
    // Combine and sort by date (newest first)
    const feedItems: FeedItem[] = [
        ...articles.map((a) => ({
            type: "article" as const,
            id: a.id,
            created_at: a.published_at || a.created_at,
            data: a,
        })),
        ...tweets.map((t) => ({
            type: "tweet" as const,
            id: t.id,
            created_at: t.created_at,
            data: t,
        })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (feedItems.length === 0) {
        return (
            <div className="brutalist-border p-12 text-center bg-muted/30">
                <p className="text-muted-foreground">Vijesti uskoro...</p>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedItems.map((item) => {
                if (item.type === "tweet") {
                    const tweet = item.data as StandaloneTweet & { roasts: TweetRoast[] }
                    return <TweetRoastCard key={`tweet-${tweet.id}`} tweet={tweet} />
                }

                const article = item.data as Article & { category?: Category; author?: Author }
                return (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group brutalist-border brutalist-shadow brutalist-hover bg-card p-6 flex flex-col"
                    >
                        {article.category && (
                            <span
                                className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 mb-4 w-fit"
                                style={{ backgroundColor: article.category.color || "#ccc" }}
                            >
                                {article.category.name}
                            </span>
                        )}

                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors flex-1 text-balance">
                            {article.title}
                        </h3>

                        {article.excerpt && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}

                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                            {article.author && <AIAuthorBadge author={article.author} size="sm" />}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-mono">{article.author?.name || "Novina"}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {getTimeAgo(article.published_at)}
                                </span>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

function getTimeAgo(date: string | null): string {
    if (!date) return ""

    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}min`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return past.toLocaleDateString("hr-HR", { day: "numeric", month: "short" })
}
