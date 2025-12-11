"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Illustration, Article } from "@/lib/types"
import { Download, Trash2, Link2, ExternalLink, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface IllustrationGalleryProps {
  illustrations: (Illustration & { article?: Pick<Article, "id" | "title" | "slug"> | null })[]
}

export function IllustrationGallery({ illustrations: initialIllustrations }: IllustrationGalleryProps) {
  const [illustrations, setIllustrations] = useState(initialIllustrations)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState<(typeof illustrations)[0] | null>(null)

  const filteredIllustrations = illustrations.filter(
    (ill) =>
      ill.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ill.article?.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("illustrations").delete().eq("id", id)
      if (error) throw error

      setIllustrations(illustrations.filter((i) => i.id !== id))
      setSelectedImage(null)
      toast.success("Ilustracija obrisana")
    } catch (error) {
      toast.error("Greška pri brisanju")
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pretraži po promptu ili članku..."
          className="brutalist-border pl-10"
        />
      </div>

      {/* Gallery Grid */}
      {filteredIllustrations.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredIllustrations.map((ill) => (
            <div
              key={ill.id}
              onClick={() => setSelectedImage(ill)}
              className="group cursor-pointer brutalist-border brutalist-hover overflow-hidden bg-card"
            >
              <div className="relative aspect-square">
                <img
                  src={ill.image_url || "/placeholder.svg"}
                  alt={ill.prompt}
                  className="w-full h-full object-cover"
                />
                {ill.article && (
                  <div className="absolute top-2 right-2 bg-foreground text-background p-1">
                    <Link2 className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs line-clamp-2">{ill.prompt}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {new Date(ill.created_at).toLocaleDateString("hr-HR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="brutalist-border p-12 text-center bg-muted/30">
          <p className="text-muted-foreground">{searchTerm ? "Nema rezultata za pretragu" : "Nema ilustracija"}</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full brutalist-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image_url || "/placeholder.svg"}
              alt={selectedImage.prompt}
              className="w-full max-h-[60vh] object-contain mb-4"
            />

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 brutalist-border">
                <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Prompt</p>
                <p className="text-sm">{selectedImage.prompt}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  <span className="font-mono">{selectedImage.model}</span>
                  <span className="mx-2">|</span>
                  <span>{new Date(selectedImage.created_at).toLocaleString("hr-HR")}</span>
                </div>

                {selectedImage.article && (
                  <a
                    href={`/article/${selectedImage.article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    {selectedImage.article.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a href={selectedImage.image_url} download target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full brutalist-border gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Preuzmi
                  </Button>
                </a>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedImage.id)}
                  className="brutalist-border gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Obriši
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
