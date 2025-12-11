"use client"

import { useState } from "react"
import {
    Settings, Trash2, Plus, GripVertical,
    Check, RefreshCw, Layers, Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { theme } from "@/lib/admin-theme"
import type { TopicsManagerProps } from "./types"
import type { NewsTopic } from "@/lib/types"

export function TopicsManager({ topics, onUpdate }: TopicsManagerProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingTopic, setEditingTopic] = useState<NewsTopic | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        prompt_template: "",
        color: "#3B82F6",
    })
    const [isSaving, setIsSaving] = useState(false)

    const defaultPrompt = `Napravi kratku vijest na hrvatskom jeziku.

Tema: [NAZIV TEME]

Zahtjevi:
- Dužina: 100-150 riječi
- Ton: informativan i profesionalan
- Format: naslov + kratak sažetak + tekst

Vrati SAMO JSON:
{
  "title": "Naslov vijesti",
  "excerpt": "Kratki sažetak u jednoj rečenici",
  "content": "Puni tekst vijesti"
}`

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const url = "/api/admin/news-topics"
            const method = editingTopic ? "PATCH" : "POST"
            const body = editingTopic ? { id: editingTopic.id, ...formData } : formData

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (response.ok) {
                setShowForm(false)
                setEditingTopic(null)
                setFormData({ name: "", description: "", prompt_template: "", color: "#3B82F6" })
                onUpdate()
            }
        } catch (error) {
            console.error("Failed to save topic:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Jeste li sigurni da želite obrisati ovu temu?")) return

        try {
            await fetch(`/api/admin/news-topics?id=${id}`, { method: "DELETE" })
            onUpdate()
        } catch (error) {
            console.error("Failed to delete topic:", error)
        }
    }

    const handleEdit = (topic: NewsTopic) => {
        setEditingTopic(topic)
        setFormData({
            name: topic.name,
            description: topic.description || "",
            prompt_template: topic.prompt_template,
            color: topic.color,
        })
        setShowForm(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Moje teme</h2>
                    <p className="text-muted-foreground">Organizirajte vijesti po temama</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingTopic(null)
                        setFormData({ name: "", description: "", prompt_template: defaultPrompt, color: "#3B82F6" })
                        setShowForm(!showForm)
                    }}
                    className={showForm ? "" : theme.buttonPrimary}
                    variant={showForm ? "outline" : "default"}
                >
                    {showForm ? "Odustani" : <><Plus className="w-4 h-4 mr-2" />Nova tema</>}
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className={`${theme.section} space-y-6`}>
                    <div>
                        <h3 className="font-bold text-lg mb-4">
                            {editingTopic ? "Uredi temu" : "Nova tema"}
                        </h3>
                    </div>

                    {/* Basic Info */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block font-medium mb-2">Naziv teme</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-3 ${theme.input}`}
                                placeholder="npr. Sport Hrvatska, Lokalne vijesti..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2">Boja oznake</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-14 h-12 cursor-pointer brutalist-border"
                                />
                                <span className="text-sm text-muted-foreground">Za lakše prepoznavanje</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Kratki opis</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full px-4 py-3 ${theme.input}`}
                            placeholder="O čemu se radi u ovoj temi?"
                        />
                    </div>

                    {/* Prompt with help */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block font-medium">Upute za AI</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, prompt_template: defaultPrompt })}
                                className="text-sm text-primary hover:underline"
                            >
                                Vrati zadano
                            </button>
                        </div>
                        <textarea
                            value={formData.prompt_template}
                            onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                            className={`w-full px-4 py-3 min-h-[200px] font-mono text-sm ${theme.input}`}
                            placeholder="Upišite upute koje AI treba slijediti..."
                            required
                        />
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                💡 Kako ovo radi?
                            </p>
                            <p className="text-blue-700 dark:text-blue-300">
                                Ove upute govore AI-u kako da piše vijesti za ovu temu.
                                Možete odrediti ton, duljinu, stil i format teksta.
                            </p>
                        </div>
                    </div>

                    <Button type="submit" disabled={isSaving} className={`w-full ${theme.buttonPrimary}`}>
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        {editingTopic ? "Spremi promjene" : "Stvori temu"}
                    </Button>
                </form>
            )}

            {/* Topics List */}
            <div className="space-y-3">
                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        className={`${theme.card} p-4 flex items-center gap-4`}
                        style={{ borderLeftWidth: 5, borderLeftColor: topic.color }}
                    >
                        <div className="cursor-grab text-muted-foreground hover:text-foreground">
                            <GripVertical className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold">{topic.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{topic.description || "Bez opisa"}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(topic)}>
                                <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(topic.id)}
                                className="text-red-500 hover:text-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {topics.length === 0 && (
                    <div className={`${theme.section} text-center py-12`}>
                        <Layers className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">Nemate još tema</h3>
                        <p className="text-muted-foreground mb-4">
                            Teme vam pomažu organizirati vijesti po kategorijama
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
