"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NovinaMascot } from "@/components/novina-mascot"
import { toast } from "sonner"
import type { ScraperSource, ScrapedContent } from "@/lib/types"
import { Plus, Trash2, Globe, RefreshCw, ExternalLink, ChevronDown, ChevronUp, FileText, Check } from "lucide-react"

interface ScraperInterfaceProps {
  sources: ScraperSource[]
  scrapedContent: (ScrapedContent & { source?: { name: string; url: string } | null })[]
}

export function ScraperInterface({ sources: initialSources, scrapedContent: initialContent }: ScraperInterfaceProps) {
  const [sources, setSources] = useState(initialSources)
  const [content, setContent] = useState(initialContent)
  const [isAddingSource, setIsAddingSource] = useState(false)
  const [newSource, setNewSource] = useState({ name: "", url: "", selector: "" })
  const [quickScrapeUrl, setQuickScrapeUrl] = useState("")
  const [isScraping, setIsScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<{ title: string; content: string } | null>(null)
  const [expandedContent, setExpandedContent] = useState<string | null>(null)

  // Add new source
  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      toast.error("Ime i URL su obavezni")
      return
    }

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nisi prijavljen")

      const { data, error } = await supabase
        .from("scraper_sources")
        .insert({
          ...newSource,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setSources([data, ...sources])
      setNewSource({ name: "", url: "", selector: "" })
      setIsAddingSource(false)
      toast.success("Izvor dodan!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Greška")
    }
  }

  // Delete source
  const handleDeleteSource = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("scraper_sources").delete().eq("id", id)
      if (error) throw error

      setSources(sources.filter((s) => s.id !== id))
      toast.success("Izvor obrisan")
    } catch (error) {
      toast.error("Greška pri brisanju")
    }
  }

  // Toggle source active
  const toggleSourceActive = async (id: string, currentValue: boolean) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("scraper_sources").update({ is_active: !currentValue }).eq("id", id)

      if (error) throw error

      setSources(sources.map((s) => (s.id === id ? { ...s, is_active: !currentValue } : s)))
    } catch (error) {
      toast.error("Greška")
    }
  }

  // Quick scrape
  const handleQuickScrape = async () => {
    if (!quickScrapeUrl) {
      toast.error("Unesi URL")
      return
    }

    setIsScraping(true)
    setScrapeResult(null)

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: quickScrapeUrl }),
      })

      if (!response.ok) throw new Error("Scraping failed")

      const data = await response.json()
      setScrapeResult({ title: data.title, content: data.content })
      toast.success("Sadržaj dohvaćen!")
    } catch (error) {
      toast.error("Greška pri dohvaćanju sadržaja")
    } finally {
      setIsScraping(false)
    }
  }

  // Scrape from source
  const handleScrapeSource = async (source: ScraperSource) => {
    setIsScraping(true)

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source.url, selector: source.selector }),
      })

      if (!response.ok) throw new Error("Scraping failed")

      const data = await response.json()

      // Save to database
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: saved, error } = await supabase
          .from("scraped_content")
          .insert({
            source_id: source.id,
            title: data.title,
            content: data.content,
            original_url: source.url,
            user_id: user.id,
          })
          .select("*, source:scraper_sources(name, url)")
          .single()

        if (!error && saved) {
          setContent([saved, ...content])
        }

        // Update last scraped
        await supabase.from("scraper_sources").update({ last_scraped: new Date().toISOString() }).eq("id", source.id)

        setSources(sources.map((s) => (s.id === source.id ? { ...s, last_scraped: new Date().toISOString() } : s)))
      }

      toast.success("Sadržaj spremljen!")
    } catch (error) {
      toast.error("Greška pri scrapanju")
    } finally {
      setIsScraping(false)
    }
  }

  // Mark content as processed
  const markAsProcessed = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("scraped_content").update({ is_processed: true }).eq("id", id)

      if (error) throw error

      setContent(content.map((c) => (c.id === id ? { ...c, is_processed: true } : c)))
    } catch (error) {
      toast.error("Greška")
    }
  }

  // Delete content
  const deleteContent = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("scraped_content").delete().eq("id", id)
      if (error) throw error

      setContent(content.filter((c) => c.id !== id))
      toast.success("Sadržaj obrisan")
    } catch (error) {
      toast.error("Greška")
    }
  }

  return (
    <div className="space-y-8">
      {/* Quick Scrape */}
      <div className="brutalist-border brutalist-shadow bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <NovinaMascot mood="experiment" size="md" />
          <div>
            <h2 className="text-xl font-bold">Brzo dohvaćanje</h2>
            <p className="text-sm text-muted-foreground font-mono">// unesi URL i dohvati sadržaj</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={quickScrapeUrl}
            onChange={(e) => setQuickScrapeUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="brutalist-border font-mono"
          />
          <Button
            onClick={handleQuickScrape}
            disabled={isScraping}
            className="brutalist-border bg-primary text-primary-foreground gap-2"
          >
            {isScraping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Dohvati
          </Button>
        </div>

        {scrapeResult && (
          <div className="mt-4 p-4 bg-muted/50 brutalist-border">
            <h4 className="font-bold mb-2">{scrapeResult.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-5">{scrapeResult.content}</p>
          </div>
        )}
      </div>

      {/* Sources */}
      <div className="brutalist-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Izvori</h2>
          <Button
            onClick={() => setIsAddingSource(!isAddingSource)}
            variant="outline"
            className="brutalist-border gap-2"
          >
            <Plus className="w-4 h-4" />
            Dodaj izvor
          </Button>
        </div>

        {/* Add Source Form */}
        {isAddingSource && (
          <div className="mb-6 p-4 bg-muted/50 brutalist-border space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-mono text-sm uppercase">Ime *</Label>
                <Input
                  value={newSource.name}
                  onChange={(e) => setNewSource((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="TechCrunch"
                  className="brutalist-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-sm uppercase">URL *</Label>
                <Input
                  value={newSource.url}
                  onChange={(e) => setNewSource((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://techcrunch.com"
                  className="brutalist-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-sm uppercase">CSS Selector (opciono)</Label>
              <Input
                value={newSource.selector}
                onChange={(e) => setNewSource((prev) => ({ ...prev, selector: e.target.value }))}
                placeholder="article, .post-content"
                className="brutalist-border font-mono"
              />
              <p className="text-xs text-muted-foreground">HTML tag ili klasa za ciljani sadržaj</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingSource(false)} className="brutalist-border">
                Odustani
              </Button>
              <Button onClick={handleAddSource} className="brutalist-border bg-primary text-primary-foreground">
                Dodaj
              </Button>
            </div>
          </div>
        )}

        {/* Sources List */}
        <div className="space-y-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className={`p-4 brutalist-border flex items-center justify-between ${
                !source.is_active ? "opacity-50" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">{source.name}</span>
                  {source.selector && <span className="text-xs font-mono bg-muted px-2 py-0.5">{source.selector}</span>}
                </div>
                <p className="text-sm font-mono text-muted-foreground mt-1 truncate">{source.url}</p>
                {source.last_scraped && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Zadnji scrape: {new Date(source.last_scraped).toLocaleString("hr-HR")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={source.is_active}
                  onCheckedChange={() => toggleSourceActive(source.id, source.is_active)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScrapeSource(source)}
                  disabled={isScraping || !source.is_active}
                  className="brutalist-border gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isScraping ? "animate-spin" : ""}`} />
                  Scrape
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSource(source.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {sources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nema izvora. Dodaj prvi!</p>
            </div>
          )}
        </div>
      </div>

      {/* Scraped Content */}
      <div className="brutalist-border bg-card p-6">
        <h2 className="text-xl font-bold mb-6">Dohvaćeni sadržaj</h2>

        <div className="space-y-3">
          {content.map((item) => (
            <div key={item.id} className={`brutalist-border p-4 ${item.is_processed ? "bg-muted/30" : "bg-card"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {item.source && (
                      <span className="text-xs font-mono bg-primary/20 px-2 py-0.5">{item.source.name}</span>
                    )}
                    {item.is_processed && (
                      <span className="text-xs font-mono bg-novina-mint px-2 py-0.5">Obrađeno</span>
                    )}
                  </div>
                  <h4 className="font-bold">{item.title || "Bez naslova"}</h4>

                  {expandedContent === item.id ? (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                      <Button variant="ghost" size="sm" onClick={() => setExpandedContent(null)} className="mt-2 gap-1">
                        <ChevronUp className="w-3 h-3" />
                        Smanji
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedContent(item.id)}
                        className="mt-1 gap-1"
                      >
                        <ChevronDown className="w-3 h-3" />
                        Proširi
                      </Button>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(item.scraped_at).toLocaleString("hr-HR")}</span>
                    {item.original_url && (
                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        Original <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!item.is_processed && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => markAsProcessed(item.id)}
                      title="Označi kao obrađeno"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteContent(item.id)} title="Obriši">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {content.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nema dohvaćenog sadržaja</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
