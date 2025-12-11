import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get("limit") || "10")

        // Fetch batches with their articles count
        const { data: batches, error } = await supabase
            .from("news_batches")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit)

        if (error) {
            return NextResponse.json({ error: "Failed to fetch batches", details: error }, { status: 500 })
        }

        return NextResponse.json({ batches })
    } catch (error) {
        console.error("Batches fetch error:", error)
        return NextResponse.json(
            {
                error: "Failed to fetch batches",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
