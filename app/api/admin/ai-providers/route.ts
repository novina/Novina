import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - List all AI providers (without API keys)
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: providers, error } = await supabase
            .from("ai_providers")
            .select("id, name, display_name, model_id, is_active, is_default, icon, color, created_at, updated_at")
            .order("display_name")

        if (error) throw error

        return NextResponse.json({ providers: providers || [] })
    } catch (error) {
        console.error("Error fetching AI providers:", error)
        return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 })
    }
}

// POST - Create new AI provider
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, display_name, model_id, icon, color, api_key } = body

        if (!name || !display_name || !model_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Simple encryption for API key (in production use proper encryption)
        const api_key_encrypted = api_key ? Buffer.from(api_key).toString("base64") : null

        const { data: provider, error } = await supabase
            .from("ai_providers")
            .insert({
                name: name.toLowerCase().replace(/\s+/g, "-"),
                display_name,
                model_id,
                icon,
                color,
                api_key_encrypted,
                user_id: user.id,
            })
            .select("id, name, display_name, model_id, is_active, is_default, icon, color")
            .single()

        if (error) throw error

        return NextResponse.json({ provider })
    } catch (error) {
        console.error("Error creating AI provider:", error)
        return NextResponse.json({ error: "Failed to create provider" }, { status: 500 })
    }
}

// PATCH - Update AI provider (including setting default)
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, is_default, is_active, api_key, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: "Provider ID required" }, { status: 400 })
        }

        // If setting as default, unset all others first
        if (is_default) {
            await supabase.from("ai_providers").update({ is_default: false }).neq("id", id)
        }

        const updates: Record<string, unknown> = {
            ...updateData,
            updated_at: new Date().toISOString(),
        }

        if (is_default !== undefined) updates.is_default = is_default
        if (is_active !== undefined) updates.is_active = is_active
        if (api_key) updates.api_key_encrypted = Buffer.from(api_key).toString("base64")

        const { data: provider, error } = await supabase
            .from("ai_providers")
            .update(updates)
            .eq("id", id)
            .select("id, name, display_name, model_id, is_active, is_default, icon, color")
            .single()

        if (error) throw error

        return NextResponse.json({ provider })
    } catch (error) {
        console.error("Error updating AI provider:", error)
        return NextResponse.json({ error: "Failed to update provider" }, { status: 500 })
    }
}

// DELETE - Remove AI provider
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
            return NextResponse.json({ error: "Provider ID required" }, { status: 400 })
        }

        const { error } = await supabase.from("ai_providers").delete().eq("id", id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting AI provider:", error)
        return NextResponse.json({ error: "Failed to delete provider" }, { status: 500 })
    }
}
