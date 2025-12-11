"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Tag } from "@/lib/types"

interface TagSelectorProps {
  selectedTags: string[]
  onChange: (tagIds: string[]) => void
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchTags = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("tags").select("*").order("name")
      setTags(data || [])
      setIsLoading(false)
    }

    fetchTags()
  }, [])

  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleTag = (tagId: string) => {
    onChange(selectedTags.includes(tagId) ? selectedTags.filter((id) => id !== tagId) : [...selectedTags, tagId])
  }

  return (
    <div className="space-y-3">
      <Label className="font-mono text-sm uppercase">Tagovi</Label>

      {/* Search */}
      <Input
        placeholder="Pretraži tagove..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="brutalist-border"
      />

      {/* Tag list */}
      <div className="flex flex-wrap gap-2 p-3 brutalist-border min-h-12 bg-muted/30">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Učitavanje tagova...</p>
        ) : filteredTags.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nema pronađenih tagova</p>
        ) : (
          filteredTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`transition-all ${
                selectedTags.includes(tag.id)
                  ? `bg-[${tag.color}] text-white border-2 border-[${tag.color}] shadow-lg`
                  : "bg-muted hover:bg-muted/80 border border-border"
              } px-3 py-1 rounded text-sm font-medium cursor-pointer`}
            >
              {tag.name}
            </button>
          ))
        )}
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-mono uppercase">Odabrani tagovi:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId)
              return tag ? (
                <Badge key={tagId} style={{ backgroundColor: tag.color || "#64748b" }} variant="secondary">
                  {tag.name}
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
