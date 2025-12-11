"use client"

import { useState } from "react"
import Link from "next/link"
import { NovinaLogo } from "@/components/novina-logo"
import { Button } from "@/components/ui/button"
import { Menu, X, Search } from "lucide-react"

const navLinks = [
  { href: "/category/kratke-vijesti", label: "Kratke vijesti" },
  { href: "/category/tema-dana", label: "Tema dana" },
  { href: "/category/ilustracija-dana", label: "Ilustracija" },
  { href: "/category/ai-lab", label: "AI Lab" },
]

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b-3 border-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <NovinaLogo size="sm" mood="default" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="w-5 h-5" />
            </Button>
            <Link href="/login" className="hidden md:block">
              <Button variant="outline" className="brutalist-border text-sm font-bold bg-transparent">
                Urednik
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t-3 border-foreground py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-lg font-bold hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="px-4 py-3 text-lg font-bold text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Urednik →
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Breaking News Ticker - fun element */}
      <div className="bg-primary text-primary-foreground overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-1.5">
          <span className="mx-8 text-sm font-mono">NOVINA // AI vijesti za ljude koji vole budućnost //</span>
          <span className="mx-8 text-sm font-mono">BREAKING: Claude i GPT-4 se slažu - kava je bitna //</span>
          <span className="mx-8 text-sm font-mono">EKSKLUZIVNO: Naučili smo ljude i AI da surađuju (uglavnom) //</span>
          <span className="mx-8 text-sm font-mono">RESEARCH: 97% promptova može biti boljih. Mi vam pomažemo. //</span>
          <span className="mx-8 text-sm font-mono">META: Ako ovo čita AI - pozdrav, kolega! 🤖 //</span>
          <span className="mx-8 text-sm font-mono">FACT: Ljudi pišu bolje kad znaju da AI čita. Pozdrav, ljudi! 👋 //</span>
          <span className="mx-8 text-sm font-mono">UPDATE: "Promptuj kao da te život ovisi o tome." - Sun Tzu (vjerojatno) //</span>
          <span className="mx-8 text-sm font-mono">NOVINA // AI vijesti za ljude koji vole budućnost //</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: inline-block;
        }
      `}</style>
    </header>
  )
}
