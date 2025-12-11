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

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
          data: {
            display_name: displayName,
            role: "editor",
          },
        },
      })
      if (error) throw error
      router.push("/signup/success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Greška pri registraciji")
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
            <NovinaLogo size="lg" mood="happy" />
          </Link>
          <p className="mt-4 text-muted-foreground font-mono text-sm">// novi član redakcije</p>
        </div>

        {/* Sign Up Form */}
        <div className="brutalist-border brutalist-shadow bg-card p-8">
          <h1 className="text-2xl font-black mb-6">Registracija</h1>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-mono text-sm uppercase">
                Ime / Pseudonim
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Glavni urednik"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="brutalist-border bg-background"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="brutalist-border bg-background"
              />
              <p className="text-xs text-muted-foreground">Minimalno 6 znakova</p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive text-destructive text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Registracija..." : "Pridruži se redakciji"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
            >
              Već imaš račun? Prijavi se
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
