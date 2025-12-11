"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { NovinaLogo } from "@/components/novina-logo"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { LayoutDashboard, FileText, Paintbrush, Link2, Globe, Twitter, LogOut, Newspaper, Sparkles } from "lucide-react"

interface AdminSidebarProps {
  user: User
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Članci", icon: FileText },
  { href: "/admin/articles/new", label: "Novi članak", icon: Newspaper },
  { href: "/admin/ai-news", label: "AI Vijesti", icon: Sparkles },
  { href: "/admin/illustrations", label: "AI Ilustracije", icon: Paintbrush },
  { href: "/admin/tweets", label: "Twitter/X", icon: Twitter },
  { href: "/admin/scraper", label: "Scraper", icon: Globe },
  { href: "/admin/links", label: "Link baza", icon: Link2 },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Determine mascot mood based on current page
  const getMascotMood = () => {
    if (pathname.includes("illustrations")) return "create"
    if (pathname.includes("scraper")) return "experiment"
    if (pathname.includes("articles/new")) return "think"
    if (pathname.includes("tweets")) return "alert"
    return "default"
  }

  return (
    <aside className="w-64 border-r-3 border-foreground bg-card flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b-3 border-foreground">
        <Link href="/admin">
          <NovinaLogo size="sm" mood={getMascotMood()} />
        </Link>
        <p className="mt-2 text-xs font-mono text-muted-foreground">// uredništvo</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors
                ${isActive ? "bg-primary text-primary-foreground brutalist-border" : "hover:bg-muted"}`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* AI Quick Action */}
      <div className="p-4 border-t-3 border-foreground">
        <Link href="/admin/ai-agent">
          <Button className="w-full brutalist-border brutalist-shadow brutalist-hover bg-accent text-accent-foreground gap-2">
            <Sparkles className="w-4 h-4" />
            AI Agent
          </Button>
        </Link>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t-3 border-foreground">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground font-mono">urednik</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Odjava">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
