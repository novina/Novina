import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function LabHero() {
    return (
        <div className="relative overflow-hidden bg-foreground text-background py-16 md:py-24 px-4 md:px-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
                <div className="grid grid-cols-12 h-full w-full">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-background/20" />
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider mb-6">
                            <Sparkles className="w-3 h-3" />
                            Eksperimentalna Zona
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                            AI <span className="text-primary-foreground/50">Lab</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-background/80 leading-relaxed max-w-xl">
                            Testiramo AI alate tako da vi ne morate. Učimo vas pisati promptove koji rade.
                            <span className="block text-sm mt-3 italic text-background/60">
                                // Jer "nemoj halucinirati" nije dovoljno dobar prompt
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <div className="brutalist-border bg-background text-foreground p-6 max-w-sm transform rotate-1 hover:rotate-0 transition-transform duration-300">
                            <h3 className="font-bold uppercase tracking-wide text-sm text-muted-foreground mb-2">
                                Alat tjedna
                            </h3>
                            <div className="font-black text-2xl mb-1">Midjourney v6</div>
                            <p className="text-sm mb-4">Fotorealizam koji oduzima dah. Razumije tekst u slikama, 8K rezolucija. Konačno.</p>
                            <Button size="sm" className="w-full" asChild>
                                <Link href="https://midjourney.com" target="_blank">
                                    Isprobaj <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
