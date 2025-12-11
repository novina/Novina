"use client"

import { useState } from "react"
import {
    Settings, Trash2, Plus, Eye, EyeOff,
    Check, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { theme } from "@/lib/admin-theme"
import type { ProvidersManagerProps } from "./types"

export function ProvidersManager({ providers, onUpdate }: ProvidersManagerProps) {
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        display_name: "",
        model_id: "",
        api_key: "",
    })
    const [showApiKey, setShowApiKey] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const popularModels = [
        { name: "Google Gemini 2.5", id: "google/gemini-2.5-flash" },
        { name: "Claude 3 Haiku", id: "anthropic/claude-3-haiku" },
        { name: "GPT-4o Mini", id: "openai/gpt-4o-mini" },
        { name: "Llama 3.1", id: "meta-llama/llama-3.1-70b-instruct" },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const response = await fetch("/api/admin/ai-providers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.display_name.toLowerCase().replace(/\s+/g, "-"),
                    ...formData,
                }),
            })

            if (response.ok) {
                setShowForm(false)
                setFormData({ display_name: "", model_id: "", api_key: "" })
                onUpdate()
            }
        } catch (error) {
            console.error("Failed to create provider:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSetDefault = async (id: string) => {
        await fetch("/api/admin/ai-providers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, is_default: true }),
        })
        onUpdate()
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Obrisati ovaj AI model?")) return
        await fetch(`/api/admin/ai-providers?id=${id}`, { method: "DELETE" })
        onUpdate()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Postavke AI modela</h2>
                    <p className="text-muted-foreground">Odaberite koji AI model koristi za pisanje</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className={showForm ? "" : theme.buttonPrimary}
                    variant={showForm ? "outline" : "default"}
                >
                    {showForm ? "Odustani" : <><Plus className="w-4 h-4 mr-2" />Dodaj model</>}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={`${theme.section} space-y-6`}>
                    <div>
                        <label className="block font-medium mb-2">Naziv</label>
                        <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            className={`w-full px-4 py-3 ${theme.input}`}
                            placeholder="npr. Moj Claude"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Model</label>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {popularModels.map((model) => (
                                <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        model_id: model.id,
                                        display_name: formData.display_name || model.name
                                    })}
                                    className={`p-3 text-left text-sm ${formData.model_id === model.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                        } rounded transition-colors`}
                                >
                                    {model.name}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={formData.model_id}
                            onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                            className={`w-full px-4 py-3 font-mono text-sm ${theme.input}`}
                            placeholder="Ili unesite vlastiti model ID"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-2">API Ključ (opcionalno)</label>
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                value={formData.api_key}
                                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                className={`w-full px-4 py-3 pr-12 font-mono text-sm ${theme.input}`}
                                placeholder="Ostavite prazno za globalni ključ"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" disabled={isSaving} className={`w-full ${theme.buttonPrimary}`}>
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        Dodaj model
                    </Button>
                </form>
            )}

            <div className="space-y-3">
                {providers.map((provider) => (
                    <div
                        key={provider.id}
                        className={`${theme.card} p-4 flex items-center justify-between`}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold">{provider.display_name}</h4>
                                {provider.is_default && (
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                        Aktivni
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{provider.model_id}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {!provider.is_default && (
                                <Button variant="outline" size="sm" onClick={() => handleSetDefault(provider.id)}>
                                    Koristi ovaj
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(provider.id)}
                                className="text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {providers.length === 0 && (
                    <div className={`${theme.section} text-center py-12`}>
                        <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">Nema AI modela</h3>
                        <p className="text-muted-foreground">
                            Potrebno je pokrenuti SQL migraciju u Supabase
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
