"use client"

import { useEffect, useRef } from "react"

interface TweetEmbedProps {
  tweetUrl: string
}

export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Twitter widget script
    const script = document.createElement("script")
    script.src = "https://platform.twitter.com/widgets.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Extract tweet ID for fallback display
  const tweetId = tweetUrl.match(/status\/(\d+)/)?.[1] || ""

  return (
    <div ref={containerRef} className="brutalist-border p-4 bg-card">
      <blockquote className="twitter-tweet" data-theme="light">
        <a href={tweetUrl}>Loading tweet...</a>
      </blockquote>

      {/* Fallback link */}
      <noscript>
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
          Pogledaj tweet na X →
        </a>
      </noscript>
    </div>
  )
}
