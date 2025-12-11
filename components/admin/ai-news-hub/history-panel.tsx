"use client"

import { Trash2, RefreshCw, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { theme } from "@/lib/admin-theme"
import type { HistoryPanelProps } from "./types"

export function HistoryPanel({ batches, onClear, onRefresh }: HistoryPanelProps) {
    const handleDeleteBatch = async (id: string) => {
        await fetch(`/api/admin/batches?id=${id}`, { method: "DELETE" })
        onRefresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Povijest</h2>
                    <p className="text-muted-foreground">Pregled svih generiranih vijesti</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Osvježi
                    </Button>
                    {batches.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClear}
                            className="text-red-500"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Obriši sve
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {batches.map((batch) => (
                    <div key={batch.id} className={`${theme.card} p-4`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-3 h-3 rounded-full ${batch.status === "completed" ? "bg-green-500" :
                                        batch.status === "failed" ? "bg-red-500" : "bg-yellow-500"
                                        }`}
                                />
                                <div>
                                    <p className="font-medium">{batch.topic?.name || "Vijest"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(batch.created_at).toLocaleString("hr-HR")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${batch.status === "completed" ? "bg-green-100 text-green-700" :
                                    batch.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100"
                                    }`}>
                                    {batch.status === "completed" ? "Uspješno" :
                                        batch.status === "failed" ? "Greška" : "U tijeku"}
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteBatch(batch.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>

                        {batch.error_message && (
                            <p className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {batch.error_message}
                            </p>
                        )}
                    </div>
                ))}

                {batches.length === 0 && (
                    <div className={`${theme.section} text-center py-12`}>
                        <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">Još nema vijesti</h3>
                        <p className="text-muted-foreground">
                            Stvorite svoju prvu AI vijest
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
