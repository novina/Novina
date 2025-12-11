"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GenerationResult {
    provider: string
    success: boolean
    articleId?: string
    error?: string
}

interface GenerationResponse {
    success: boolean
    batchId: string
    articlesGenerated: number
    results: GenerationResult[]
}

export function NewsGenerationTrigger() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<GenerationResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch("/api/news/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type: "manual" }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to generate news")
            }

            const data = await response.json()
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="brutalist-border bg-card p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            AI News Generation
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Generiraj novi set kratkih vijesti od svih AI urednika (Claude, Gemini, ChatGPT, Grok).
                            <br />
                            <span className="text-xs italic">// Proces može trajati 30-60 sekundi</span>
                        </p>
                    </div>
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto">
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generiranje u tijeku...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generiraj vijesti
                        </>
                    )}
                </Button>
            </div>

            {/* Results */}
            {result && (
                <Alert className="brutalist-border bg-novina-mint/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>
                        <div className="space-y-2">
                            <p className="font-bold">
                                Uspješno generirano {result.articlesGenerated} od 4 vijesti
                            </p>
                            <div className="space-y-1 text-sm">
                                {result.results.map((r) => (
                                    <div key={r.provider} className="flex items-center gap-2">
                                        {r.success ? (
                                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                                        ) : (
                                            <XCircle className="w-3 h-3 text-red-600" />
                                        )}
                                        <span className="font-mono capitalize">{r.provider}:</span>
                                        {r.success ? (
                                            <span className="text-muted-foreground">Uspješno</span>
                                        ) : (
                                            <span className="text-red-600 text-xs">{r.error}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Batch ID: {result.batchId}</p>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Error */}
            {error && (
                <Alert className="brutalist-border bg-red-100 dark:bg-red-950/20 text-red-900 dark:text-red-100">
                    <XCircle className="w-4 h-4" />
                    <AlertDescription>
                        <p className="font-bold">Greška</p>
                        <p className="text-sm">{error}</p>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
