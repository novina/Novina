"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { NovinaMascot } from "@/components/novina-mascot"
import { toast } from "sonner"
import { Twitter, Plus, Trash2, Sparkles, Loader2, ExternalLink, Check } from "lucide-react"

interface RoastModel {
    id: string
    name: string
    icon: string
}

interface TweetRoast {
    id: string
    model_id: string
    model_name: string
    roast_text: string
    roast_type: string
    created_at: string
}

interface StandaloneTweet {
    id: string
    tweet_url: string
    tweet_id: string
    tweet_content: string | null
    tweet_author: string | null
    is_published: boolean
    created_at: string
    roasts?: TweetRoast[]
}

export function TweetRoastManager() {
    const [tweets, setTweets] = useState<StandaloneTweet[]>([])
    const [models, setModels] = useState<RoastModel[]>([])
    const [loading, setLoading] = useState(true)

    // Form state
    const [tweetUrl, setTweetUrl] = useState("")
    const [tweetContent, setTweetContent] = useState("")
    const [tweetAuthor, setTweetAuthor] = useState("")
    const [selectedModels, setSelectedModels] = useState<string[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchTweets()
        fetchModels()
    }, [])

    const fetchTweets = async () => {
        const { data, error } = await supabase
            .from("standalone_tweets")
            .select("*, roasts:tweet_roasts(*)")
            .order("created_at", { ascending: false })

        if (!error && data) {
            setTweets(data)
        }
        setLoading(false)
    }

    const fetchModels = async () => {
        try {
            const res = await fetch("/api/tweets/roast")
            const data = await res.json()
            if (data.models) {
                setModels(data.models)
            }
        } catch (e) {
            console.error("Failed to fetch models:", e)
        }
    }

    const extractTweetId = (url: string) => {
        const match = url.match(/status\/(\d+)/)
        return match ? match[1] : ""
    }

    const toggleModel = (modelId: string) => {
        setSelectedModels((prev) =>
            prev.includes(modelId)
                ? prev.filter((m) => m !== modelId)
                : [...prev, modelId]
        )
    }

    const handleAddTweet = async () => {
        if (!tweetUrl || !tweetContent) {
            toast.error("Unesite URL i sadržaj tweeta")
            return
        }

        const tweetId = extractTweetId(tweetUrl)
        if (!tweetId) {
            toast.error("Neispravan Twitter/X URL")
            return
        }

        setIsAdding(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Nisi prijavljen")

            // Insert tweet
            const { data: tweet, error } = await supabase
                .from("standalone_tweets")
                .insert({
                    tweet_url: tweetUrl,
                    tweet_id: tweetId,
                    tweet_content: tweetContent,
                    tweet_author: tweetAuthor || null,
                    user_id: user.id,
                })
                .select()
                .single()

            if (error) throw error

            // Generate roasts if models selected
            if (selectedModels.length > 0) {
                setIsGenerating(true)

                const roastRes = await fetch("/api/tweets/roast", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tweetId: tweet.id,
                        tweetContent,
                        models: selectedModels,
                    }),
                })

                const roastData = await roastRes.json()

                if (roastData.success) {
                    toast.success(`Generirano ${roastData.saved} roast-ova!`)
                }
            }

            // Reset form
            setTweetUrl("")
            setTweetContent("")
            setTweetAuthor("")
            setSelectedModels([])

            // Refresh list
            fetchTweets()
            toast.success("Tweet dodan!")

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Greška")
        } finally {
            setIsAdding(false)
            setIsGenerating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Obrisati tweet i sve roast-ove?")) return

        const { error } = await supabase
            .from("standalone_tweets")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Greška pri brisanju")
        } else {
            setTweets(tweets.filter((t) => t.id !== id))
            toast.success("Obrisano!")
        }
    }

    const togglePublish = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from("standalone_tweets")
            .update({ is_published: !current })
            .eq("id", id)

        if (!error) {
            setTweets(tweets.map((t) =>
                t.id === id ? { ...t, is_published: !current } : t
            ))
        }
    }

    const generateMoreRoasts = async (tweet: StandaloneTweet) => {
        if (selectedModels.length === 0) {
            toast.error("Odaberi barem jedan model")
            return
        }

        setIsGenerating(true)

        try {
            const res = await fetch("/api/tweets/roast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tweetId: tweet.id,
                    tweetContent: tweet.tweet_content,
                    models: selectedModels,
                }),
            })

            const data = await res.json()

            if (data.success) {
                toast.success(`Generirano ${data.saved} novih roast-ova!`)
                fetchTweets()
            } else {
                toast.error(data.error || "Greška")
            }
        } catch (e) {
            toast.error("Greška pri generiranju")
        } finally {
            setIsGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Add New Tweet */}
            <Card className="brutalist-border brutalist-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <NovinaMascot mood="experiment" size="sm" />
                        Novi Tweet + AI Roast
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Tweet URL */}
                    <div className="space-y-2">
                        <Label>Tweet URL</Label>
                        <div className="flex items-center gap-2">
                            <Twitter className="w-5 h-5 text-muted-foreground" />
                            <Input
                                value={tweetUrl}
                                onChange={(e) => setTweetUrl(e.target.value)}
                                placeholder="https://x.com/user/status/..."
                                className="brutalist-border"
                            />
                        </div>
                    </div>

                    {/* Tweet Content */}
                    <div className="space-y-2">
                        <Label>Sadržaj tweeta (za AI kontekst)</Label>
                        <Textarea
                            value={tweetContent}
                            onChange={(e) => setTweetContent(e.target.value)}
                            placeholder="Kopirajte tekst tweeta ovdje..."
                            rows={3}
                            className="brutalist-border"
                        />
                    </div>

                    {/* Tweet Author */}
                    <div className="space-y-2">
                        <Label>Autor (opcionalno)</Label>
                        <Input
                            value={tweetAuthor}
                            onChange={(e) => setTweetAuthor(e.target.value)}
                            placeholder="@username"
                            className="brutalist-border"
                        />
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                        <Label>Odaberi AI modele za roast</Label>
                        <div className="flex flex-wrap gap-2">
                            {models.map((model) => (
                                <Button
                                    key={model.id}
                                    type="button"
                                    variant={selectedModels.includes(model.id) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleModel(model.id)}
                                    className="gap-1"
                                >
                                    <span>{model.icon}</span>
                                    {model.name}
                                    {selectedModels.includes(model.id) && <Check className="w-3 h-3" />}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleAddTweet}
                        disabled={isAdding || isGenerating || !tweetUrl || !tweetContent}
                        className="w-full brutalist-border brutalist-shadow gap-2"
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generiram roast-ove...</>
                        ) : isAdding ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Dodajem...</>
                        ) : (
                            <><Plus className="w-4 h-4" /> Dodaj tweet {selectedModels.length > 0 && `+ ${selectedModels.length} AI roast`}</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Tweets List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Tweetovi s AI komentarima ({tweets.length})</h2>

                {tweets.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        <Twitter className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Nema tweetova. Dodaj prvi!</p>
                    </Card>
                ) : (
                    tweets.map((tweet) => (
                        <Card key={tweet.id} className={`brutalist-border ${!tweet.is_published && "opacity-70"}`}>
                            <CardContent className="pt-6 space-y-4">
                                {/* Tweet Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                                            {tweet.tweet_author && (
                                                <span className="font-medium">{tweet.tweet_author}</span>
                                            )}
                                            <a
                                                href={tweet.tweet_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                            >
                                                Otvori <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                        <p className="text-sm bg-muted/50 p-3 rounded">{tweet.tweet_content}</p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Switch
                                            checked={tweet.is_published}
                                            onCheckedChange={() => togglePublish(tweet.id, tweet.is_published)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(tweet.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Roasts */}
                                {tweet.roasts && tweet.roasts.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            AI Komentari ({tweet.roasts.length})
                                        </h4>
                                        <div className="grid gap-2">
                                            {tweet.roasts.map((roast) => (
                                                <div
                                                    key={roast.id}
                                                    className="p-3 bg-accent/20 rounded border-l-4 border-primary"
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold">{roast.model_name}</span>
                                                    </div>
                                                    <p className="text-sm">{roast.roast_text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Generate More */}
                                <div className="flex items-center gap-2 pt-2 border-t">
                                    <span className="text-xs text-muted-foreground">Dodaj još:</span>
                                    {models.slice(0, 3).map((model) => (
                                        <Button
                                            key={model.id}
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                setSelectedModels([model.id])
                                                generateMoreRoasts(tweet)
                                            }}
                                            disabled={isGenerating}
                                        >
                                            {model.icon} {model.name}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
