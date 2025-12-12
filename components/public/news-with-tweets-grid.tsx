import Link from "next/link"
import type { Article, Category, Author, StandaloneTweet, TweetRoast } from "@/lib/types"
import { Clock } from "lucide-react"
import { AIAuthorBadge } from "./ai-author-badge"
import { TweetRoastCard } from "./tweet-roast-card"

interface NewsWithTweetsGridProps {
    articles: (Article & { category?: Category; author?: Author })[]
    tweets?: (StandaloneTweet & { roasts: TweetRoast[] })[]
}

export function NewsWithTweetsGrid({ articles, tweets = [] }: NewsWithTweetsGridProps) {
    // Interleave articles and tweets
    const items: Array<{ type: "article" | "tweet"; data: typeof articles[0] | typeof tweets[0] }> = []

    let articleIndex = 0
    let tweetIndex = 0
    let position = 0

    while (articleIndex < articles.length || tweetIndex < tweets.length) {
        // Insert tweet every 3rd position (positions 2, 5, 8...)
        if ((position + 1) % 3 === 0 && tweetIndex < tweets.length) {
            items.push({ type: "tweet", data: tweets[tweetIndex] })
            tweetIndex++
        } else if (articleIndex < articles.length) {
            items.push({ type: "article", data: articles[articleIndex] })
            articleIndex++
        } else if (tweetIndex < tweets.length) {
            items.push({ type: "tweet", data: tweets[tweetIndex] })
            tweetIndex++
        }
        position++
    }

    if (items.length === 0) {
        return (
            <div className="brutalist-border p-12 text-center bg-muted/30">
                <p className="text-muted-foreground">Vijesti uskoro...</p>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
                if (item.type === "tweet") {
                    const tweet = item.data as StandaloneTweet & { roasts: TweetRoast[] }
                    return <TweetRoastCard key={`tweet-${tweet.id}`} tweet={tweet} />
                }

                const article = item.data as Article & { category?: Category; author?: Author }
                return (
                    <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className={`group brutalist-border brutalist-shadow brutalist-hover bg-card p-6 flex flex-col ${index === 0 ? "md:col-span-2 lg:col-span-1" : ""
                            }`}
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
                            {/* AI Author Badge */}
                            {article.author && <AIAuthorBadge author={article.author} size="sm" />}

                            {/* Metadata */}
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
