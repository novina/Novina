"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

export function SeedContentButton() {
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const handleSeed = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/seed-content", {
                method: "POST",
                credentials: "include",
            })
            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
                setDone(true)
                // Reload page to show new content
                setTimeout(() => window.location.reload(), 1500)
            } else {
                toast.error(data.error || "Greška pri kreiranju sadržaja")
            }
        } catch (error) {
            toast.error("Greška pri povezivanju s API-jem")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <Button disabled className="gap-2 bg-green-500">
                <Check className="w-4 h-4" />
                Sadržaj kreiran!
            </Button>
        )
    }

    return (
        <Button
            onClick={handleSeed}
            disabled={loading}
            className="gap-2 brutalist-border brutalist-shadow brutalist-hover"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
            {loading ? "Kreiram sadržaj..." : "Generiraj početni sadržaj"}
        </Button>
    )
}
