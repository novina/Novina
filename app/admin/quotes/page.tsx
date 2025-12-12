"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { NovinaMascot } from "@/components/novina-mascot"
import { Plus, Trash2, Edit2, Save, X, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface FunnyQuote {
    id: string
    text: string
    mood: string
    url: string | null
    is_active: boolean
    sort_order: number
    created_at: string
}

const MOODS = [
    { value: "happy", label: "😊 Happy" },
    { value: "think", label: "🤔 Think" },
    { value: "experiment", label: "🔬 Experiment" },
    { value: "curious", label: "🧐 Curious" },
    { value: "alert", label: "⚠️ Alert" },
    { value: "create", label: "🎨 Create" },
    { value: "future", label: "🚀 Future" },
]

export default function QuotesAdminPage() {
    const [quotes, setQuotes] = useState<FunnyQuote[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showNewForm, setShowNewForm] = useState(false)

    // Form state
    const [formText, setFormText] = useState("")
    const [formMood, setFormMood] = useState("happy")
    const [formUrl, setFormUrl] = useState("")
    const [formActive, setFormActive] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        fetchQuotes()
    }, [])

    const fetchQuotes = async () => {
        const { data, error } = await supabase
            .from("funny_quotes")
            .select("*")
            .order("sort_order", { ascending: true })

        if (error) {
            toast.error("Greška pri dohvaćanju šala")
            console.error(error)
        } else {
            setQuotes(data || [])
        }
        setLoading(false)
    }

    const resetForm = () => {
        setFormText("")
        setFormMood("happy")
        setFormUrl("")
        setFormActive(true)
        setEditingId(null)
        setShowNewForm(false)
    }

    const handleEdit = (quote: FunnyQuote) => {
        setFormText(quote.text)
        setFormMood(quote.mood)
        setFormUrl(quote.url || "")
        setFormActive(quote.is_active)
        setEditingId(quote.id)
        setShowNewForm(false)
    }

    const handleSave = async () => {
        if (!formText.trim()) {
            toast.error("Tekst šale je obavezan")
            return
        }

        const quoteData = {
            text: formText.trim(),
            mood: formMood,
            url: formUrl.trim() || null,
            is_active: formActive,
            updated_at: new Date().toISOString(),
        }

        if (editingId) {
            // Update existing
            const { error } = await supabase
                .from("funny_quotes")
                .update(quoteData)
                .eq("id", editingId)

            if (error) {
                toast.error("Greška pri spremanju")
                console.error(error)
            } else {
                toast.success("Šala ažurirana!")
                fetchQuotes()
                resetForm()
            }
        } else {
            // Create new
            const { error } = await supabase
                .from("funny_quotes")
                .insert({
                    ...quoteData,
                    sort_order: quotes.length + 1,
                })

            if (error) {
                toast.error("Greška pri kreiranju")
                console.error(error)
            } else {
                toast.success("Šala kreirana!")
                fetchQuotes()
                resetForm()
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Sigurno želite obrisati ovu šalu?")) return

        const { error } = await supabase
            .from("funny_quotes")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Greška pri brisanju")
            console.error(error)
        } else {
            toast.success("Šala obrisana!")
            fetchQuotes()
        }
    }

    const toggleActive = async (id: string, currentState: boolean) => {
        const { error } = await supabase
            .from("funny_quotes")
            .update({ is_active: !currentState })
            .eq("id", id)

        if (error) {
            toast.error("Greška pri ažuriranju")
        } else {
            fetchQuotes()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black">Šale & Citati</h1>
                    <p className="text-muted-foreground">Upravljaj duhovitim porukama koje se prikazuju na naslovnici</p>
                </div>
                <Button onClick={() => { resetForm(); setShowNewForm(true) }} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova šala
                </Button>
            </div>

            {/* New/Edit Form */}
            {(showNewForm || editingId) && (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <CardTitle>{editingId ? "Uredi šalu" : "Nova šala"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tekst šale *</Label>
                            <Textarea
                                value={formText}
                                onChange={(e) => setFormText(e.target.value)}
                                placeholder="Unesite duhovit tekst..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Raspoloženje maskote</Label>
                                <Select value={formMood} onValueChange={setFormMood}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOODS.map((mood) => (
                                            <SelectItem key={mood.value} value={mood.value}>
                                                {mood.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>URL (opcionalno)</Label>
                                <Input
                                    value={formUrl}
                                    onChange={(e) => setFormUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formActive}
                                onCheckedChange={setFormActive}
                            />
                            <Label>Aktivna</Label>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex-1 flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                                <NovinaMascot mood={formMood as "happy" | "think" | "experiment" | "curious" | "alert" | "create" | "future"} size="sm" />
                                <p className="text-sm font-mono">
                                    <span className="text-primary font-bold">$</span> {formText || "Preview šale..."}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={resetForm}>
                                <X className="w-4 h-4 mr-2" />
                                Odustani
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="w-4 h-4 mr-2" />
                                Spremi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quotes List */}
            <div className="space-y-3">
                {quotes.map((quote) => (
                    <Card key={quote.id} className={`${!quote.is_active ? "opacity-50" : ""}`}>
                        <CardContent className="py-4">
                            <div className="flex items-center gap-4">
                                <NovinaMascot
                                    mood={quote.mood as "happy" | "think" | "experiment" | "curious" | "alert" | "create" | "future"}
                                    size="sm"
                                />
                                <div className="flex-1">
                                    <p className="font-mono text-sm">
                                        <span className="text-primary font-bold">$</span> {quote.text}
                                    </p>
                                    {quote.url && (
                                        <a
                                            href={quote.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            {quote.url}
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={quote.is_active}
                                        onCheckedChange={() => toggleActive(quote.id, quote.is_active)}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(quote)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(quote.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {quotes.length === 0 && (
                    <Card className="py-12">
                        <CardContent className="text-center text-muted-foreground">
                            <NovinaMascot mood="curious" size="lg" className="mx-auto mb-4" />
                            <p>Nema šala. Dodajte prvu!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
