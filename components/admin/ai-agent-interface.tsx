"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NovinaMascot } from "@/components/novina-mascot"
import { toast } from "sonner"
import type { Illustration } from "@/lib/types"
import { Sparkles, Download, Link2, Trash2, Wand2, RefreshCw } from "lucide-react"

interface AIAgentInterfaceProps {
  recentIllustrations: (Illustration & { article?: { title: string; slug: string } | null })[]
  articles: { id: string; title: string; slug: string }[]
}

const STYLES = [
  { value: "default", label: "Default" },
  { value: "brutalist", label: "Brutalist" },
  { value: "retro", label: "Retro Futurism" },
  { value: "minimal", label: "Minimal" },
  { value: "editorial", label: "Editorial" },
  { value: "surreal", label: "Surreal" },
]

const PROMPT_SUGGESTIONS = [
  "Futuristic robot reading newspaper in coffee shop",
  "Abstract visualization of artificial intelligence neural network",
  "Cyberpunk city skyline at sunset with flying cars",
  "Vintage computer with AI brain emerging from screen",
  "Human and robot shaking hands, symbolizing collaboration",
  "Digital garden growing from smartphone screen",
  "News headlines floating in virtual reality space",
  "Curious desk lamp robot exploring stack of books",
]

export function AIAgentInterface({ recentIllustrations, articles }: AIAgentInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("default") // Updated default value to be a non-empty string
  const [articleId, setArticleId] = useState<string>("none")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [illustrations, setIllustrations] = useState(recentIllustrations)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Unesi prompt za generiranje")
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          articleId: articleId === "none" ? undefined : articleId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      toast.success("Ilustracija generirana!")

      // Refresh illustrations list
      const supabase = createClient()
      const { data: newIllustrations } = await supabase
        .from("illustrations")
        .select("*, article:articles(title, slug)")
        .order("created_at", { ascending: false })
        .limit(10)

      if (newIllustrations) {
        setIllustrations(newIllustrations)
      }
    } catch (error) {
      toast.error("Greška pri generiranju ilustracije")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("illustrations").delete().eq("id", id)
      if (error) throw error

      setIllustrations(illustrations.filter((i) => i.id !== id))
      toast.success("Ilustracija obrisana")
    } catch (error) {
      toast.error("Greška pri brisanju")
    }
  }

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Generator Panel */}
      <div className="space-y-6">
        <div className="brutalist-border brutalist-shadow bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <NovinaMascot mood="create" size="md" />
            <div>
              <h2 className="text-xl font-bold">Generiraj ilustraciju</h2>
              <p className="text-sm text-muted-foreground font-mono">// powered by fal.ai</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Prompt */}
            <div className="space-y-2">
              <Label className="font-mono text-sm uppercase">Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Opiši ilustraciju koju želiš generirati..."
                className="brutalist-border min-h-[120px]"
              />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label className="font-mono text-sm uppercase">Stil</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="brutalist-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link to Article */}
            <div className="space-y-2">
              <Label className="font-mono text-sm uppercase">Poveži s člankom (opciono)</Label>
              <Select value={articleId} onValueChange={setArticleId}>
                <SelectTrigger className="brutalist-border">
                  <SelectValue placeholder="Odaberi članak..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez članka</SelectItem>
                  {articles.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generiram...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generiraj
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="brutalist-border bg-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Prijedlozi promptova
          </h3>
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="text-xs font-mono px-3 py-1.5 bg-muted hover:bg-accent/50 transition-colors text-left"
              >
                {suggestion.substring(0, 40)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="space-y-6">
        {/* Generated Image Preview */}
        {(generatedImage || isGenerating) && (
          <div className="brutalist-border brutalist-shadow bg-card p-6">
            <h3 className="font-bold mb-4">Rezultat</h3>

            {isGenerating ? (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="text-center">
                  <NovinaMascot mood="experiment" size="lg" />
                  <p className="mt-4 font-mono text-sm text-muted-foreground animate-pulse">AI crta ilustraciju...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated illustration"
                  className="w-full brutalist-border"
                />
                <div className="flex items-center gap-2">
                  <a
                    href={generatedImage}
                    download="novina-illustration.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full brutalist-border gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Preuzmi
                    </Button>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Recent Illustrations */}
        <div className="brutalist-border bg-card p-6">
          <h3 className="font-bold mb-4">Nedavne ilustracije</h3>

          {illustrations.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {illustrations.map((ill) => (
                <div key={ill.id} className="group relative brutalist-border overflow-hidden">
                  <img
                    src={ill.image_url || "/placeholder.svg"}
                    alt={ill.prompt}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                    <p className="text-background text-xs text-center line-clamp-3 mb-2">{ill.prompt}</p>
                    {ill.article && (
                      <p className="text-background/70 text-xs font-mono flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {ill.article.title.substring(0, 20)}...
                      </p>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(ill.id)} className="mt-2">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <NovinaMascot mood="curious" size="md" />
              <p className="mt-2 text-sm">Još nema ilustracija</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
