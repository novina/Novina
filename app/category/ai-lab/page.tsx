import { getAILabArticles } from "@/lib/queries"
import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { LabHero } from "@/components/ai-lab/lab-hero"
import { PromptCard } from "@/components/ai-lab/prompt-card"
import { ToolCard } from "@/components/ai-lab/tool-card"
import { ShortNewsGrid } from "@/components/public/short-news-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Terminal, Wrench } from "lucide-react"

export const metadata = {
    title: "AI Lab - Novina",
    description: "Eksperimentalna zona za AI alate, promptove i edukaciju.",
}

// Hardcoded data for initial version
const PROMPTS = [
    {
        title: "Midjourney Fotorealizam",
        prompt: "Portrait of a cyberpunk street vendor, neon lights reflecting on wet pavement, 8k resolution, highly detailed, cinematic lighting, shot on 35mm lens, f/1.8 --v 6.0",
        tags: ["midjourney", "art", "cyberpunk"],
        model: "Midjourney v6",
        explanation: "Specifičnost je ključ. Definirali smo žanr, postavku, tehničke detalje (8k, 35mm, f/1.8) i suptilne elemente (neon, mokri asfalt). MJ v6 voli detalje."
    },
    {
        title: "ChatGPT Code Reviewer",
        prompt: "Act as a senior React developer with 10+ years experience. Review the following code for: 1) Performance bottlenecks (re-renders, memory leaks), 2) Accessibility (ARIA, keyboard nav), 3) Best practices (hooks, state management). Provide specific fixes with code examples. Be brutally honest.",
        tags: ["coding", "react", "review"],
        model: "GPT-4",
        explanation: "Precizirali smo godine iskustva, strukturirali zahtjeve brojevima, specificirali tehnički žargon. 'Be brutally honest' ohrabruje direktan feedback."
    },
    {
        title: "SEO Content Machine",
        prompt: "Write a 1500-word SEO-optimized article about [TOPIC]. Requirements: compelling H1 title (max 60 chars), meta description (150-160 chars), H2/H3 hierarchy, keyword density 1-2%, internal linking suggestions. Tone: authoritative but conversational. Target audience: tech-savvy professionals aged 25-45.",
        tags: ["writing", "seo", "marketing"],
        model: "Claude 3 Opus",
        explanation: "Kvantificirani zahtjevi (1500 riječi, 60 chars) + target audience = precizni rezultati. Claude je odličan za long-form content s strukturom."
    },
    {
        title: "Logo Minimalizam",
        prompt: "Vector logo for tech startup 'NeuralFlow', concept: abstract neural network node, style: geometric minimalism, colors: deep blue (#1E3A8A) and electric cyan (#06B6D4), composition: centered, scalable, works in monochrome, white background --no gradients --no text --v 6.0",
        tags: ["design", "logo", "midjourney"],
        model: "Midjourney v6",
        explanation: "Dali smo hex kodove boja, tehnički brief (skalabilnost, monokrom test) i jasne --no parametre. Profesionalni pristup = profesionalni rezultati."
    }
] as const

const TOOLS = [
    {
        name: "Cursor",
        description: "VS Code na steroidima. Autocomplete koji razumije kontekst cijelog projekta. Ctrl+K za inline edit = game changer za refactoring.",
        url: "https://cursor.sh",
        category: "Coding",
        priceModel: "Freemium" as const
    },
    {
        name: "Perplexity",
        description: "Google + ChatGPT = Perplexity. Dobivate direktan odgovor s izvorima. Bez browsanja 10 članaka da nađete info.",
        url: "https://perplexity.ai",
        category: "Search",
        priceModel: "Freemium" as const
    },
    {
        name: "Runway",
        description: "Text-to-video, image-to-video, video editing s AI. Gen-3 Alpha generira 10s videoe. Nije Hollywood (još), ali je impresivno.",
        url: "https://runwayml.com",
        category: "Video",
        priceModel: "Freemium" as const
    },
    {
        name: "Claude",
        description: "200K token kontekst = čita cijelu kodebazu odjednom. Anthropic ga dizajnirao za sigurnost. Odličan za analizu i long-form pisanje.",
        url: "https://claude.ai",
        category: "Chat",
        priceModel: "Free" as const
    }
] as const

export default async function AILabPage() {
    // Optimizirano: jedan query s inner join, bez waterfall-a
    const articles = await getAILabArticles(6)

    return (
        <div className="min-h-screen bg-background">
            <PublicHeader />

            <main>
                <LabHero />

                <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                    <Tabs defaultValue="prompts" className="w-full">
                        <div className="flex items-center justify-center mb-12">
                            <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1 bg-muted/50 border border-border">
                                <TabsTrigger value="prompts" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Terminal className="w-4 h-4 mr-2" />
                                    Promptovi
                                </TabsTrigger>
                                <TabsTrigger value="tools" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Wrench className="w-4 h-4 mr-2" />
                                    Alati
                                </TabsTrigger>
                                <TabsTrigger value="news" className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Vijesti
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="prompts" className="space-y-8">
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <h2 className="text-3xl font-black mb-4">Promptoteka</h2>
                                <p className="text-muted-foreground">
                                    Promptovi koji rade. Kopiraj, razumij logiku, prilagodi.
                                    <span className="block text-sm mt-2 italic">// Jer generic promptovi daju generic rezultate</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {PROMPTS.map((prompt, index) => (
                                    <PromptCard key={index} {...prompt} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="tools" className="space-y-8">
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <h2 className="text-3xl font-black mb-4">Alati koji rade posao</h2>
                                <p className="text-muted-foreground">
                                    Isprobano u ratu. Bez marketinških priča - ovo su alati koje zaista koristimo.
                                    <span className="block text-sm mt-2 italic">// Za razliku od onih što samo prave buku</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {TOOLS.map((tool, index) => (
                                    <ToolCard key={index} {...tool} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="news" className="space-y-8">
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <h2 className="text-3xl font-black mb-4">Lab Vijesti</h2>
                                <p className="text-muted-foreground">
                                    Eksperimenti, otkrića i neuspjesi iz našeg AI laboratorija. Transparentnost je ključ.
                                    <span className="block text-sm mt-2 italic">// Dijelimo sve - čak i kad ne radi</span>
                                </p>
                            </div>
                            {articles.length > 0 ? (
                                <ShortNewsGrid articles={articles} />
                            ) : (
                                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                    <p className="text-muted-foreground">Trenutno nema vijesti u ovoj kategoriji.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <PublicFooter />
        </div>
    )
}
