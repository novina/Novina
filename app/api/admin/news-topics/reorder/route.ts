import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST - Reorder topics via drag & drop
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { orderedIds } = body

        if (!Array.isArray(orderedIds)) {
            return NextResponse.json({ error: "orderedIds array required" }, { status: 400 })
        }

        // Update sort_order for each topic
        const updates = orderedIds.map((id: string, index: number) =>
            supabase
                .from("news_topics")
                .update({ sort_order: index + 1 })
                .eq("id", id)
        )

        await Promise.all(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error reordering topics:", error)
        return NextResponse.json({ error: "Failed to reorder topics" }, { status: 500 })
    }
}
