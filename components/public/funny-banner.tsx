"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { NovinaMascot } from "@/components/novina-mascot"
import Link from "next/link"

interface FunnyQuote {
  id: string
  text: string
  mood: string
  url: string | null
}

// Fallback jokes if database is empty or fails
const fallbackJokes = [
  { id: "1", text: "Zašto AI nikad ne gubi ključeve? Jer koristi hash tablice!", mood: "happy", url: null },
  { id: "2", text: "ChatGPT ušao u bar... i odmah napisao 500 riječi o tome.", mood: "think", url: null },
]

export function FunnyBanner() {
  const [quote, setQuote] = useState<FunnyQuote>(fallbackJokes[0])
  const [quotes, setQuotes] = useState<FunnyQuote[]>(fallbackJokes)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchQuotes = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("funny_quotes")
        .select("id, text, mood, url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (!error && data && data.length > 0) {
        setQuotes(data)
        setQuote(data[Math.floor(Math.random() * data.length)])
      }
      setIsLoaded(true)
    }

    fetchQuotes()
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    // Change quote every 30 seconds
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
        setQuote(randomQuote)
        setIsVisible(true)
      }, 300)
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoaded, quotes])

  const content = (
    <div
      className={`flex items-center gap-4 justify-center transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
    >
      <NovinaMascot
        mood={quote.mood as "happy" | "think" | "experiment" | "curious" | "alert" | "create" | "future"}
        size="sm"
        animate={false}
      />
      <p className="text-sm md:text-base font-mono">
        <span className="text-primary font-bold">$</span> {quote.text}
      </p>
    </div>
  )

  return (
    <div className="bg-accent/20 border-y-3 border-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        {quote.url ? (
          <Link
            href={quote.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
          >
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  )
}
