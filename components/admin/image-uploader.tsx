"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link2, X, ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [mode, setMode] = useState<"url" | "upload">("url")
  const [urlInput, setUrlInput] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUrlSubmit = () => {
    if (urlInput) {
      onChange(urlInput)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, convert to base64 data URL
    // In production, you'd upload to a storage service
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      onChange(dataUrl)
      setUrlInput(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    onChange("")
    setUrlInput("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
          className="brutalist-border gap-2"
        >
          <Link2 className="w-4 h-4" />
          URL
        </Button>
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
          className="brutalist-border gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>

      {/* URL Input */}
      {mode === "url" && (
        <div className="flex items-center gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="brutalist-border font-mono text-sm"
          />
          <Button type="button" variant="outline" onClick={handleUrlSubmit} className="brutalist-border bg-transparent">
            Postavi
          </Button>
        </div>
      )}

      {/* File Upload */}
      {mode === "upload" && (
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="brutalist-border w-full gap-2"
          >
            <Upload className="w-4 h-4" />
            Odaberi sliku
          </Button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative brutalist-border p-2 bg-muted/50">
          <img src={value || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={clearImage}
            className="absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!value && (
        <div className="brutalist-border p-8 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="w-8 h-8 mb-2" />
          <p className="text-sm">Nema slike</p>
        </div>
      )}
    </div>
  )
}
