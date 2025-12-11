import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - List all news topics ordered by sort_order
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: topics, error } = await supabase
            .from("news_topics")
            .select("*")
            .order("sort_order")

        if (error) throw error

        return NextResponse.json({ topics: topics || [] })
    } catch (error) {
        console.error("Error fetching news topics:", error)
        return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
    }
}

// POST - Create new news topic
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, prompt_template, icon, color } = body

        if (!name || !prompt_template) {
            return NextResponse.json({ error: "Name and prompt template required" }, { status: 400 })
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")

        // Get max sort_order
        const { data: maxOrder } = await supabase
            .from("news_topics")
            .select("sort_order")
            .order("sort_order", { ascending: false })
            .limit(1)
            .single()

        const sort_order = (maxOrder?.sort_order || 0) + 1

        const { data: topic, error } = await supabase
            .from("news_topics")
            .insert({
                name,
                slug,
                description,
                prompt_template,
                icon,
                color: color || "#3B82F6",
                sort_order,
                user_id: user.id,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ topic })
    } catch (error) {
        console.error("Error creating news topic:", error)
        return NextResponse.json({ error: "Failed to create topic" }, { status: 500 })
    }
}

// PATCH - Update news topic
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: "Topic ID required" }, { status: 400 })
        }

        const { data: topic, error } = await supabase
            .from("news_topics")
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ topic })
    } catch (error) {
        console.error("Error updating news topic:", error)
        return NextResponse.json({ error: "Failed to update topic" }, { status: 500 })
    }
}

// DELETE - Remove news topic
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Topic ID required" }, { status: 400 })
        }

        const { error } = await supabase.from("news_topics").delete().eq("id", id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting news topic:", error)
        return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 })
    }
}
