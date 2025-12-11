import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - List all batches with enhanced info
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "20")

        const { data: batches, error } = await supabase
            .from("news_batches")
            .select(`
        *,
        topic:news_topics(id, name, icon, color),
        provider:ai_providers(id, display_name, icon, color)
      `)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (error) throw error

        return NextResponse.json({ batches: batches || [] })
    } catch (error) {
        console.error("Error fetching batches:", error)
        return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 })
    }
}

// DELETE - Delete single batch or clear all
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const clearAll = searchParams.get("clearAll") === "true"

        if (clearAll) {
            // Delete all batches - use gte on created_at to match all records
            const { error } = await supabase
                .from("news_batches")
                .delete()
                .gte("created_at", "1970-01-01")
            if (error) throw error
            return NextResponse.json({ success: true, message: "All batches cleared" })
        }

        if (!id) {
            return NextResponse.json({ error: "Batch ID required" }, { status: 400 })
        }

        const { error } = await supabase.from("news_batches").delete().eq("id", id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting batch:", error)
        return NextResponse.json({ error: "Failed to delete batch" }, { status: 500 })
    }
}
