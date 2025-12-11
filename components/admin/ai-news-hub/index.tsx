"use client"

import { useState, useEffect, useCallback } from "react"
import { Newspaper, Settings, Wand2, History, Layers, RefreshCw } from "lucide-react"
import { NovinaMascot } from "@/components/novina-mascot"
import { theme } from "@/lib/admin-theme"
import type { AIProviderConfig, NewsTopic, NewsBatch } from "@/lib/types"

// Import sub-components
import { NewsCreator } from "./news-creator"
import { TopicsManager } from "./topics-manager"
import { ProvidersManager } from "./providers-manager"
import { HistoryPanel } from "./history-panel"

export function AINewsHub() {
    const [activeTab, setActiveTab] = useState<"create" | "topics" | "providers" | "history">("create")
    const [providers, setProviders] = useState<AIProviderConfig[]>([])
    const [topics, setTopics] = useState<NewsTopic[]>([])
    const [batches, setBatches] = useState<NewsBatch[]>([])
    const [selectedProvider, setSelectedProvider] = useState<string>("")
    const [selectedTopic, setSelectedTopic] = useState<string>("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [generationResult, setGenerationResult] = useState<{ success: boolean; message: string } | null>(null)
    const [generatedArticle, setGeneratedArticle] = useState<{
        id: string
        title: string
        excerpt: string
        content: string
        slug: string
    } | null>(null)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [providersRes, topicsRes, batchesRes] = await Promise.all([
                fetch("/api/admin/ai-providers"),
                fetch("/api/admin/news-topics"),
                fetch("/api/admin/batches?limit=10"),
            ])

            if (providersRes.ok) {
                const data = await providersRes.json()
                setProviders(data.providers || [])
                const defaultProvider = data.providers?.find((p: AIProviderConfig) => p.is_default)
                if (defaultProvider) setSelectedProvider(defaultProvider.id)
            }

            if (topicsRes.ok) {
                const data = await topicsRes.json()
                setTopics(data.topics || [])
                if (data.topics?.[0]) setSelectedTopic(data.topics[0].id)
            }

            if (batchesRes.ok) {
                const data = await batchesRes.json()
                setBatches(data.batches || [])
            }
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleGenerate = async (customInstructions?: string) => {
        if (!selectedProvider || !selectedTopic) return

        setIsGenerating(true)
        setGenerationResult(null)
        setGeneratedArticle(null)

        try {
            const response = await fetch("/api/news/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "manual",
                    provider_id: selectedProvider,
                    topic_id: selectedTopic,
                    custom_instructions: customInstructions,
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setGenerationResult({
                    success: true,
                    message: `Vijest "${data.article?.title}" uspješno generirana!`
                })
                setGeneratedArticle(data.article)
                await fetchData()
            } else {
                setGenerationResult({
                    success: false,
                    message: data.details || data.error || "Generiranje nije uspjelo"
                })
            }
        } catch (error) {
            setGenerationResult({
                success: false,
                message: error instanceof Error ? error.message : "Nepoznata greška"
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleClearHistory = async () => {
        if (!confirm("Jeste li sigurni da želite obrisati svu povijest?")) return

        try {
            const res = await fetch("/api/admin/batches?clearAll=true", { method: "DELETE" })
            if (res.ok) {
                setBatches([])
                await fetchData()
            }
        } catch (error) {
            console.error("Failed to clear history:", error)
        }
    }

    const tabs = [
        { id: "create", label: "Stvori vijest", icon: Wand2 },
        { id: "topics", label: "Moje teme", icon: Layers },
        { id: "providers", label: "Postavke", icon: Settings },
        { id: "history", label: "Povijest", icon: History },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Učitavanje...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3">
                        <Newspaper className="w-8 h-8" />
                        AI Vijesti
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Kreirajte vijesti uz pomoć umjetne inteligencije
                    </p>
                </div>
                <NovinaMascot mood="experiment" size="lg" />
            </div>

            {/* Tabs */}
            <div className={theme.card}>
                <div className="flex">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-colors border-r-3 last:border-r-0 border-foreground ${isActive ? theme.tabActive : theme.tabInactive
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "create" && (
                <NewsCreator
                    providers={providers}
                    topics={topics}
                    selectedProvider={selectedProvider}
                    selectedTopic={selectedTopic}
                    onProviderChange={setSelectedProvider}
                    onTopicChange={setSelectedTopic}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    result={generationResult}
                    generatedArticle={generatedArticle}
                />
            )}

            {activeTab === "topics" && (
                <TopicsManager topics={topics} onUpdate={fetchData} />
            )}

            {activeTab === "providers" && (
                <ProvidersManager providers={providers} onUpdate={fetchData} />
            )}

            {activeTab === "history" && (
                <HistoryPanel batches={batches} onClear={handleClearHistory} onRefresh={fetchData} />
            )}
        </div>
    )
}
