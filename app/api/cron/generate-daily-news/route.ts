import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { NewsOrchestrator } from "@/lib/ai-providers"

export const dynamic = "force-dynamic"
export const maxDuration = 60 // Maximum execution time in seconds

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = await createClient()

        // Create service role client for cron jobs (bypassing RLS)
        // Note: You may need to create a service role client if RLS is strict
        // For now, we'll use a system user approach

        // Create a new batch
        const { data: batch, error: batchError } = await supabase
            .from("news_batches")
            .insert({
                batch_date: new Date().toISOString().split("T")[0],
                generation_type: "scheduled",
                status: "pending",
                user_id: null, // System-generated
            })
            .select()
            .single()

        if (batchError || !batch) {
            console.error("Failed to create batch:", batchError)
            return NextResponse.json({ error: "Failed to create batch" }, { status: 500 })
        }

        // Update batch status to processing
        await supabase.from("news_batches").update({ status: "processing" }).eq("id", batch.id)

        // For automated generation, we need a system user ID
        // This is a workaround - you might want to create a dedicated system user
        const systemUserId = "00000000-0000-0000-0000-000000000000" // Placeholder

        // Generate news from all AI providers
        const orchestrator = new NewsOrchestrator()
        const results = await orchestrator.generateAllNews(systemUserId, batch.id)

        // Count successful generations
        const successCount = results.filter((r) => r.success).length
        const hasErrors = results.some((r) => !r.success)
        const errorMessages = results
            .filter((r) => !r.success)
            .map((r) => `${r.provider}: ${r.error}`)
            .join("; ")

        // Update batch with results
        await supabase
            .from("news_batches")
            .update({
                status: successCount > 0 ? "completed" : "failed",
                articles_generated: successCount,
                error_message: hasErrors ? errorMessages : null,
                completed_at: new Date().toISOString(),
            })
            .eq("id", batch.id)

        return NextResponse.json({
            success: true,
            batchId: batch.id,
            articlesGenerated: successCount,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("Cron job error:", error)
        return NextResponse.json(
            {
                error: "Failed to generate daily news",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
