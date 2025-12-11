import Link from "next/link"
import { ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ToolCardProps {
    name: string
    description: string
    url: string
    category: string
    priceModel?: "Free" | "Freemium" | "Paid" | "Open Source"
    className?: string
}

export function ToolCard({ name, description, url, category, priceModel, className }: ToolCardProps) {
    return (
        <div className={cn("brutalist-border bg-card p-6 flex flex-col h-full group hover:translate-x-1 hover:-translate-y-1 transition-transform duration-200", className)}>
            <div className="flex items-start justify-between mb-4">
                <div className="inline-block text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1">
                    {category}
                </div>
                {priceModel && (
                    <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-1 rounded-full">
                        {priceModel}
                    </span>
                )}
            </div>

            <h3 className="font-black text-xl mb-2 group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-muted-foreground text-sm mb-6 flex-grow">{description}</p>

            <Button asChild variant="default" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground">
                <Link href={url} target="_blank" rel="noopener noreferrer">
                    Isprobaj alat
                    <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
            </Button>
        </div>
    )
}
