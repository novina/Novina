"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromptCardProps {
    title: string
    prompt: string
    tags?: readonly string[]
    model?: string
    explanation?: string
    className?: string
}

export function PromptCard({ title, prompt, tags, model, explanation, className }: PromptCardProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn("brutalist-border bg-card p-6 flex flex-col gap-4 h-full", className)}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-bold text-lg leading-tight mb-2">{title}</h3>
                    {model && (
                        <span className="inline-block text-xs font-mono bg-muted px-2 py-1 rounded-sm uppercase tracking-wider">
                            {model}
                        </span>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="flex-shrink-0 h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-sm font-mono text-sm leading-relaxed flex-grow overflow-y-auto max-h-[200px] border border-border/50">
                {prompt}
            </div>

            {explanation && (
                <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-sm">
                    <p className="text-xs text-foreground/80 leading-relaxed">
                        <span className="font-bold text-primary">Zašto radi:</span> {explanation}
                    </p>
                </div>
            )}

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {tags.map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
