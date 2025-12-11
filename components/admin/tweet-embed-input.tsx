"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Twitter } from "lucide-react"

interface TweetEmbedInputProps {
  tweets: string[]
  onChange: (tweets: string[]) => void
}

export function TweetEmbedInput({ tweets, onChange }: TweetEmbedInputProps) {
  const [newTweet, setNewTweet] = useState("")

  const addTweet = () => {
    if (newTweet && isValidTweetUrl(newTweet)) {
      onChange([...tweets, newTweet])
      setNewTweet("")
    }
  }

  const removeTweet = (index: number) => {
    onChange(tweets.filter((_, i) => i !== index))
  }

  const isValidTweetUrl = (url: string) => {
    return url.includes("twitter.com") || url.includes("x.com")
  }

  const extractTweetId = (url: string) => {
    const match = url.match(/status\/(\d+)/)
    return match ? match[1] : url
  }

  return (
    <div className="space-y-4">
      <Label className="font-mono text-sm uppercase flex items-center gap-2">
        <Twitter className="w-4 h-4" />
        Twitter/X Embedovi
      </Label>

      {/* Existing tweets */}
      {tweets.length > 0 && (
        <div className="space-y-2">
          {tweets.map((tweet, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 brutalist-border">
              <Twitter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm font-mono truncate">...{extractTweetId(tweet)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTweet(index)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new tweet */}
      <div className="flex items-center gap-2">
        <Input
          value={newTweet}
          onChange={(e) => setNewTweet(e.target.value)}
          placeholder="https://twitter.com/user/status/123..."
          className="brutalist-border font-mono text-sm"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTweet())}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addTweet}
          disabled={!newTweet || !isValidTweetUrl(newTweet)}
          className="brutalist-border bg-transparent"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">Zalijepi linkove na tweetove koje želiš ugraditi u članak</p>
    </div>
  )
}
