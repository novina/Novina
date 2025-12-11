"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NovinaLogo } from "@/components/novina-logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/admin")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Greška pri prijavi")

      // Check for specific Supabase errors
      if (error instanceof Error && error.message.includes("Email not confirmed")) {
        setError("Email nije potvrđen. Molimo provjeri svoj inbox (i spam folder) ili isključi 'Confirm email' u Supabase postavkama.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <NovinaLogo size="lg" mood="curious" />
          </Link>
          <p className="mt-4 text-muted-foreground font-mono text-sm">// pristup uredništvu</p>
        </div>

        {/* Login Form */}
        <div className="brutalist-border brutalist-shadow bg-card p-8">
          <h1 className="text-2xl font-black mb-6">Prijava</h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-sm uppercase">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="urednik@novina.hr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="brutalist-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-sm uppercase">
                Lozinka
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="brutalist-border bg-background"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive text-destructive text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Prijava..." : "Uđi u redakciju"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
            >
              Nemaš račun? Registriraj se
            </Link>
          </div>
        </div>

        {/* Fun footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground font-mono">&gt; AI urednici nikad ne spavaju_</p>
      </div>
    </div>
  )
}
