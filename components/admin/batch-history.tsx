"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { hr } from "date-fns/locale"
import { Clock, CheckCircle, XCircle, Loader } from "lucide-react"
import type { NewsBatch } from "@/lib/types"

export function BatchHistory() {
    const [batches, setBatches] = useState<NewsBatch[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchBatches()
    }, [])

    const fetchBatches = async () => {
        try {
            const response = await fetch("/api/news/batches")
            if (response.ok) {
                const data = await response.json()
                setBatches(data.batches || [])
            }
        } catch (error) {
            console.error("Failed to fetch batches:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case "failed":
                return <XCircle className="w-4 h-4 text-red-600" />
            case "processing":
                return <Loader className="w-4 h-4 text-blue-600 animate-spin" />
            default:
                return <Clock className="w-4 h-4 text-gray-400" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 dark:bg-green-950/20 text-green-900 dark:text-green-100"
            case "failed":
                return "bg-red-100 dark:bg-red-950/20 text-red-900 dark:text-red-100"
            case "processing":
                return "bg-blue-100 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100"
            default:
                return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        }
    }

    if (isLoading) {
        return (
            <div className="brutalist-border bg-card p-8 text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Učitavanje...</p>
            </div>
        )
    }

    if (batches.length === 0) {
        return (
            <div className="brutalist-border bg-card p-8 text-center">
                <p className="text-muted-foreground">Još nema generiranih batcheva.</p>
                <p className="text-xs text-muted-foreground mt-1">Klikni "Generiraj vijesti" za prvi batch.</p>
            </div>
        )
    }

    return (
        <div className="brutalist-border bg-card">
            <div className="p-4 border-b border-border">
                <h3 className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Povijest generacija
                </h3>
            </div>

            <div className="divide-y divide-border">
                {batches.map((batch) => (
                    <div key={batch.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getStatusIcon(batch.status)}
                                    <span className="font-mono text-sm">
                                        {new Date(batch.batch_date).toLocaleDateString("hr-HR")}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(batch.status)}`}>
                                        {batch.status}
                                    </span>
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>
                                        <span className="font-medium">Tip:</span>{" "}
                                        {batch.generation_type === "scheduled" ? "Automatski" : "Ručno"}
                                    </div>
                                    <div>
                                        <span className="font-medium">Generirano članaka:</span> {batch.articles_generated}
                                    </div>
                                    <div>
                                        <span className="font-medium">Vrijeme:</span>{" "}
                                        {formatDistanceToNow(new Date(batch.created_at), {
                                            addSuffix: true,
                                            locale: hr,
                                        })}
                                    </div>
                                    {batch.error_message && (
                                        <div className="text-red-600 dark:text-red-400 text-xs mt-2">
                                            <span className="font-medium">Greška:</span> {batch.error_message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
