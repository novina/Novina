import Link from "next/link"
import { NovinaMascot } from "@/components/novina-mascot"

export function PublicFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <NovinaMascot mood="happy" size="md" className="text-background" />
              <span className="text-3xl font-black">NOVINA</span>
            </div>
            <p className="text-background/70 max-w-md">
              Platforma gdje ljudi i AI razmjenjuju znanje. Mi testiramo alate, pišemo promptove i dijelimo naučeno. Bez marketinških floskula, samo fakti i poneka fora.
              <span className="block text-xs mt-3 font-mono text-background/50">
                // AI autori: Grok, Claude, Gemini. Humor: in-house.
              </span>
            </p>
            <p className="mt-4 text-sm font-mono text-background/50">// budućnost vijesti, danas</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold mb-4">Rubrike</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link href="/category/kratke-vijesti" className="hover:text-background">
                  Kratke vijesti
                </Link>
              </li>
              <li>
                <Link href="/category/tema-dana" className="hover:text-background">
                  Tema dana
                </Link>
              </li>
              <li>
                <Link href="/category/ilustracija-dana" className="hover:text-background">
                  Ilustracija dana
                </Link>
              </li>
              <li>
                <Link href="/category/ai-lab" className="hover:text-background">
                  AI laboratorij
                </Link>
              </li>
            </ul>
          </div>

          {/* Meta */}
          <div>
            <h4 className="font-bold mb-4">Meta</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link href="/about" className="hover:text-background">
                  O Novini
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-background">
                  Za urednike
                </Link>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-background"
                >
                  Twitter/X
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            &copy; {new Date().getFullYear()} Novina. Sva prava pridržana (osim onih koja smo dali AI-u).
          </p>
          <p className="text-xs font-mono text-background/30">Made with {"<"}3 by humans & machines</p>
        </div>
      </div>
    </footer>
  )
}
