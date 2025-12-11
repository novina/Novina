"use client"

import type { AIProviderConfig, NewsTopic, NewsBatch } from "@/lib/types"

// Props za NewsCreator komponentu
export interface NewsCreatorProps {
    providers: AIProviderConfig[]
    topics: NewsTopic[]
    selectedProvider: string
    selectedTopic: string
    onProviderChange: (id: string) => void
    onTopicChange: (id: string) => void
    onGenerate: (customInstructions?: string) => void
    isGenerating: boolean
    result: { success: boolean; message: string } | null
    generatedArticle: {
        id: string
        title: string
        excerpt: string
        content: string
        slug: string
    } | null
}

// Props za TopicsManager komponentu
export interface TopicsManagerProps {
    topics: NewsTopic[]
    onUpdate: () => void
}

// Props za ProvidersManager komponentu
export interface ProvidersManagerProps {
    providers: AIProviderConfig[]
    onUpdate: () => void
}

// Props za HistoryPanel komponentu
export interface HistoryPanelProps {
    batches: NewsBatch[]
    onClear: () => void
    onRefresh: () => void
}
