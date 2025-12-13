import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { NovinaMascot } from "@/components/novina-mascot"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface TweetPageProps {
    params: Promise<{ id: string }>
}

export default async function TweetPage({ params }: TweetPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: tweet, error } = await supabase
        .from("standalone_tweets")
        .select("*, roasts:tweet_roasts(*)")
        .eq("id", id)
        .eq("is_published", true)
        .single()

    if (error || !tweet) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <PublicHeader />

            <main className="py-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Natrag na naslovnicu
                    </Link>

                    {/* Tweet Card */}
                    <article className="brutalist-border brutalist-shadow bg-gradient-to-br from-foreground/5 via-background to-primary/5 p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-foreground flex items-center justify-center">
                                    <svg className="w-6 h-6 text-background" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </div>
                                <div>
                                    {tweet.tweet_author && (
                                        <p className="font-bold">{tweet.tweet_author}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(tweet.created_at).toLocaleDateString("hr-HR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={tweet.tweet_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-foreground hover:underline flex items-center gap-1"
                            >
                                Otvori na X <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Tweet Content */}
                        <div className="text-xl leading-relaxed mb-8 font-medium">
                            {tweet.tweet_content}
                        </div>

                        {/* Divider */}
                        <div className="border-t-3 border-dashed border-foreground/20 my-8"></div>

                        {/* AI Roasts Section */}
                        {tweet.roasts && tweet.roasts.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <NovinaMascot mood="experiment" size="md" />
                                    <h2 className="text-2xl font-black">AI Komentari</h2>
                                </div>

                                <div className="space-y-4">
                                    {tweet.roasts.map((roast: { id: string; model_name: string; roast_text: string }) => (
                                        <div
                                            key={roast.id}
                                            className="p-5 bg-card brutalist-border"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-sm font-bold bg-primary text-primary-foreground px-3 py-1">
                                                    🔥 {roast.model_name}
                                                </span>
                                            </div>
                                            <p className="text-foreground leading-relaxed">
                                                {roast.roast_text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Roasts */}
                        {(!tweet.roasts || tweet.roasts.length === 0) && (
                            <div className="text-center text-muted-foreground py-8">
                                <NovinaMascot mood="think" size="lg" className="mx-auto mb-4" />
                                <p>AI još razmišlja o komentaru...</p>
                            </div>
                        )}
                    </article>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
