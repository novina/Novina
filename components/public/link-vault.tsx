import type { Link as LinkType } from "@/lib/types"
import { ExternalLink, Bookmark } from "lucide-react"

interface LinkVaultProps {
  links: LinkType[]
}

export function LinkVault({ links }: LinkVaultProps) {
  if (links.length === 0) {
    return (
      <div className="border-2 border-background/30 p-12 text-center">
        <Bookmark className="w-8 h-8 mx-auto mb-4 opacity-50" />
        <p className="opacity-70">Link trezor se puni...</p>
      </div>
    )
  }

  // Group by category
  const grouped = links.reduce(
    (acc, link) => {
      const cat = link.category || "Ostalo"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(link)
      return acc
    },
    {} as Record<string, LinkType[]>,
  )

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(grouped).map(([category, categoryLinks]) => (
        <div key={category}>
          <h3 className="text-sm font-mono uppercase tracking-wider mb-4 opacity-70">{category}</h3>
          <ul className="space-y-3">
            {categoryLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 hover:opacity-70 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">{link.title}</span>
                    {link.description && <p className="text-sm opacity-70 mt-0.5 line-clamp-2">{link.description}</p>}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
