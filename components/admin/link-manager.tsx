"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { Link as LinkType } from "@/lib/types"
import { Plus, Trash2, Star, ExternalLink } from "lucide-react"

interface LinkManagerProps {
  initialLinks: LinkType[]
}

const LINK_CATEGORIES = ["AI alati", "Vijesti", "Razvoj", "Dizajn", "Produktivnost", "Zabava", "Obrazovanje", "Ostalo"]

export function LinkManager({ initialLinks }: LinkManagerProps) {
  const [links, setLinks] = useState<LinkType[]>(initialLinks)
  const [isAdding, setIsAdding] = useState(false)
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
    is_featured: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async () => {
    if (!newLink.title || !newLink.url) {
      toast.error("Naslov i URL su obavezni")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nisi prijavljen")

      const { data, error } = await supabase
        .from("links")
        .insert({
          ...newLink,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setLinks([data, ...links])
      setNewLink({ title: "", url: "", description: "", category: "", is_featured: false })
      setIsAdding(false)
      toast.success("Link dodan!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Greška pri dodavanju")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("links").delete().eq("id", id)
      if (error) throw error

      setLinks(links.filter((l) => l.id !== id))
      toast.success("Link obrisan!")
    } catch (error) {
      toast.error("Greška pri brisanju")
    }
  }

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("links").update({ is_featured: !currentValue }).eq("id", id)

      if (error) throw error

      setLinks(links.map((l) => (l.id === id ? { ...l, is_featured: !currentValue } : l)))
    } catch (error) {
      toast.error("Greška pri ažuriranju")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Button */}
      {!isAdding && (
        <Button
          onClick={() => setIsAdding(true)}
          className="brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Dodaj link
        </Button>
      )}

      {/* Add New Form */}
      {isAdding && (
        <div className="brutalist-border bg-card p-6 space-y-4">
          <h3 className="font-bold">Novi link</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-mono text-sm uppercase">Naslov *</Label>
              <Input
                value={newLink.title}
                onChange={(e) => setNewLink((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ime resursa"
                className="brutalist-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-sm uppercase">URL *</Label>
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="brutalist-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-sm uppercase">Opis</Label>
            <Textarea
              value={newLink.description}
              onChange={(e) => setNewLink((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Kratki opis..."
              className="brutalist-border"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label className="font-mono text-sm uppercase">Kategorija</Label>
              <select
                value={newLink.category}
                onChange={(e) => setNewLink((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 brutalist-border bg-background"
              >
                <option value="">Odaberi...</option>
                {LINK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={newLink.is_featured}
                onCheckedChange={(checked) => setNewLink((prev) => ({ ...prev, is_featured: checked }))}
              />
              <Label className="text-sm">Istaknuto</Label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)} className="brutalist-border">
              Odustani
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isLoading}
              className="brutalist-border bg-primary text-primary-foreground"
            >
              {isLoading ? "Dodavanje..." : "Dodaj"}
            </Button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className={`brutalist-border p-4 bg-card flex items-start gap-4 ${
              link.is_featured ? "border-primary" : ""
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:text-primary flex items-center gap-1"
                >
                  {link.title}
                  <ExternalLink className="w-3 h-3" />
                </a>
                {link.category && <span className="text-xs font-mono bg-muted px-2 py-0.5">{link.category}</span>}
              </div>
              {link.description && <p className="text-sm text-muted-foreground mt-1">{link.description}</p>}
              <p className="text-xs font-mono text-muted-foreground mt-2 truncate">{link.url}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFeatured(link.id, link.is_featured)}
                title={link.is_featured ? "Ukloni iz istaknutih" : "Dodaj u istaknute"}
              >
                <Star className={`w-4 h-4 ${link.is_featured ? "fill-primary text-primary" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} title="Obriši">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="brutalist-border p-8 bg-muted/20 text-center text-muted-foreground">
            <p>Nema linkova. Dodaj prvi!</p>
          </div>
        )}
      </div>
    </div>
  )
}
