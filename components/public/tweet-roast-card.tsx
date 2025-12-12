import Link from "next/link"
import type { StandaloneTweet } from "@/lib/types"

interface TweetRoastCardProps {
    tweet: StandaloneTweet
}

export function TweetRoastCard({ tweet }: TweetRoastCardProps) {
    // Get first roast for display
    const featuredRoast = tweet.roasts?.[0]

    return (
        <Link href={`/tweet/${tweet.id}`} className="block group">
            <article className="relative overflow-hidden brutalist-border brutalist-shadow brutalist-hover bg-gradient-to-br from-[#1DA1F2]/10 via-background to-primary/10 p-6 h-full">
                {/* Twitter Icon Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-[#1DA1F2] flex items-center justify-center">
                    <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </div>

                {/* Author */}
                {tweet.tweet_author && (
                    <div className="text-sm font-medium text-[#1DA1F2] mb-2">
                        {tweet.tweet_author}
                    </div>
                )}

                {/* Tweet Content */}
                <p className="text-foreground mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
                    {tweet.tweet_content}
                </p>

                {/* AI Roast */}
                {featuredRoast && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-foreground/20">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5">
                                🔥 {featuredRoast.model_name}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground italic line-clamp-2">
                            "{featuredRoast.roast_text}"
                        </p>
                    </div>
                )}

                {/* More roasts indicator */}
                {tweet.roasts && tweet.roasts.length > 1 && (
                    <div className="mt-3 text-xs text-muted-foreground">
                        + {tweet.roasts.length - 1} AI {tweet.roasts.length - 1 === 1 ? "komentar" : "komentara"}
                    </div>
                )}
            </article>
        </Link>
    )
}
