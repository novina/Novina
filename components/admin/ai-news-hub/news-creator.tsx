"use client"

import { useState } from "react"
import {
    ChevronDown, Check, RefreshCw, Rss,
    FileText, HelpCircle, Lightbulb,
    Wand2, BookOpen, ArrowRight, Link2, Settings, Newspaper
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { theme } from "@/lib/admin-theme"
import type { NewsCreatorProps } from "./types"

export function NewsCreator({
    providers,
    topics,
    selectedProvider,
    selectedTopic,
    onProviderChange,
    onTopicChange,
    onGenerate,
    isGenerating,
    result,
    generatedArticle,
}: NewsCreatorProps) {
    const [step, setStep] = useState(1)
    const [newsSource, setNewsSource] = useState<"ai" | "url" | "rss" | "text">("ai")
    const [sourceUrl, setSourceUrl] = useState("")
    const [sourceText, setSourceText] = useState("")
    const [customInstructions, setCustomInstructions] = useState("")

    const selectedTopicData = topics.find((t) => t.id === selectedTopic)
    const selectedProviderData = providers.find((p) => p.id === selectedProvider)

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <button
                            onClick={() => setStep(s)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s
                                ? "bg-primary text-primary-foreground"
                                : step > s
                                    ? "bg-green-500 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </button>
                        {s < 3 && (
                            <div className={`w-12 h-1 mx-2 ${step > s ? "bg-green-500" : "bg-muted"}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* STEP 1: Choose Topic */}
            {step === 1 && (
                <StepChooseTopic
                    topics={topics}
                    selectedTopic={selectedTopic}
                    onTopicChange={onTopicChange}
                    onNext={() => setStep(2)}
                />
            )}

            {/* STEP 2: Choose Source */}
            {step === 2 && (
                <StepChooseSource
                    newsSource={newsSource}
                    setNewsSource={setNewsSource}
                    sourceUrl={sourceUrl}
                    setSourceUrl={setSourceUrl}
                    sourceText={sourceText}
                    setSourceText={setSourceText}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                />
            )}

            {/* STEP 3: Review and Generate */}
            {step === 3 && (
                <StepReviewGenerate
                    selectedTopicData={selectedTopicData}
                    newsSource={newsSource}
                    sourceUrl={sourceUrl}
                    providers={providers}
                    selectedProvider={selectedProvider}
                    onProviderChange={onProviderChange}
                    customInstructions={customInstructions}
                    setCustomInstructions={setCustomInstructions}
                    result={result}
                    generatedArticle={generatedArticle}
                    isGenerating={isGenerating}
                    onGenerate={onGenerate}
                    onBack={() => setStep(2)}
                />
            )}
        </div>
    )
}

// ===== STEP 1: Choose Topic =====
function StepChooseTopic({
    topics,
    selectedTopic,
    onTopicChange,
    onNext,
}: {
    topics: NewsCreatorProps["topics"]
    selectedTopic: string
    onTopicChange: (id: string) => void
    onNext: () => void
}) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">O čemu želite vijest?</h2>
                <p className="text-muted-foreground">Odaberite temu iz vaše liste ili kreirajte novu</p>
            </div>

            {/* Topic Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {topics.filter(t => t.is_active).map((topic) => (
                    <button
                        key={topic.id}
                        onClick={() => {
                            onTopicChange(topic.id)
                            onNext()
                        }}
                        className={`${theme.card} ${theme.cardHover} p-6 text-left transition-all ${selectedTopic === topic.id ? "ring-2 ring-primary" : ""
                            }`}
                        style={{ borderLeftWidth: 5, borderLeftColor: topic.color }}
                    >
                        <h3 className="text-lg font-bold mb-2">{topic.name}</h3>
                        <p className="text-sm text-muted-foreground">{topic.description || "Kliknite za odabir"}</p>
                    </button>
                ))}
            </div>

            {topics.length === 0 && (
                <div className={`${theme.section} text-center py-12`}>
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">Nemate još tema</h3>
                    <p className="text-muted-foreground mb-4">
                        Kreirajte svoju prvu temu za vijesti
                    </p>
                </div>
            )}

            {/* Quick tip */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3">
                <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Savjet:</strong> Tema određuje o čemu će AI pisati.
                        Možete imati različite teme poput "Tehnologija", "Sport Hrvatska", "Lokalne vijesti" itd.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ===== STEP 2: Choose Source =====
function StepChooseSource({
    newsSource,
    setNewsSource,
    sourceUrl,
    setSourceUrl,
    sourceText,
    setSourceText,
    onBack,
    onNext,
}: {
    newsSource: "ai" | "url" | "rss" | "text"
    setNewsSource: (source: "ai" | "url" | "rss" | "text") => void
    sourceUrl: string
    setSourceUrl: (url: string) => void
    sourceText: string
    setSourceText: (text: string) => void
    onBack: () => void
    onNext: () => void
}) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Odakle crpiti informacije?</h2>
                <p className="text-muted-foreground">Odaberite izvor na temelju kojeg će AI napisati vijest</p>
            </div>

            {/* Source Options */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* AI Generated */}
                <button
                    onClick={() => { setNewsSource("ai"); onNext(); }}
                    className={`${theme.card} ${theme.cardHover} p-6 text-left ${newsSource === "ai" ? "ring-2 ring-primary" : ""}`}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Wand2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1">AI stvara vijest</h3>
                            <p className="text-sm text-muted-foreground">
                                Umjetna inteligencija će sama osmisliti i napisati vijest na odabranu temu
                            </p>
                        </div>
                    </div>
                </button>

                {/* From URL */}
                <button
                    onClick={() => setNewsSource("url")}
                    className={`${theme.card} ${theme.cardHover} p-6 text-left ${newsSource === "url" ? "ring-2 ring-primary" : ""}`}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Link2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1">Iz web stranice</h3>
                            <p className="text-sm text-muted-foreground">
                                Zalijepite link na postojeću vijest koju AI treba prepričati
                            </p>
                        </div>
                    </div>
                </button>

                {/* From RSS */}
                <button
                    onClick={() => setNewsSource("rss")}
                    className={`${theme.card} ${theme.cardHover} p-6 text-left ${newsSource === "rss" ? "ring-2 ring-primary" : ""}`}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Rss className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1">Iz RSS feeda</h3>
                            <p className="text-sm text-muted-foreground">
                                Povežite RSS feed portala za automatsko dohvaćanje vijesti
                            </p>
                            <span className="text-xs text-muted-foreground">(Uskoro)</span>
                        </div>
                    </div>
                </button>

                {/* From Text */}
                <button
                    onClick={() => setNewsSource("text")}
                    className={`${theme.card} ${theme.cardHover} p-6 text-left ${newsSource === "text" ? "ring-2 ring-primary" : ""}`}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-1">Iz teksta</h3>
                            <p className="text-sm text-muted-foreground">
                                Zalijepite tekst koji AI treba pretvoriti u vijest
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* URL Input */}
            {newsSource === "url" && (
                <div className={`${theme.section} space-y-4 animate-in slide-in-from-bottom-4`}>
                    <label className="block font-medium">Unesite link na vijest:</label>
                    <input
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://primjer.hr/vijest/..."
                        className={`w-full px-4 py-3 text-lg ${theme.input}`}
                    />
                    <Button
                        onClick={onNext}
                        disabled={!sourceUrl}
                        className={`w-full ${theme.buttonPrimary}`}
                    >
                        Nastavi <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            {/* Text Input */}
            {newsSource === "text" && (
                <div className={`${theme.section} space-y-4 animate-in slide-in-from-bottom-4`}>
                    <label className="block font-medium">Zalijepite izvorni tekst:</label>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Kopirajte ovdje tekst vijesti koju želite da AI prepiše..."
                        className={`w-full px-4 py-3 min-h-[200px] ${theme.input}`}
                    />
                    <Button
                        onClick={onNext}
                        disabled={!sourceText}
                        className={`w-full ${theme.buttonPrimary}`}
                    >
                        Nastavi <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>
                    ← Natrag
                </Button>
            </div>
        </div>
    )
}

// ===== STEP 3: Review and Generate =====
function StepReviewGenerate({
    selectedTopicData,
    newsSource,
    sourceUrl,
    providers,
    selectedProvider,
    onProviderChange,
    customInstructions,
    setCustomInstructions,
    result,
    generatedArticle,
    isGenerating,
    onGenerate,
    onBack,
}: {
    selectedTopicData: NewsCreatorProps["topics"][0] | undefined
    newsSource: "ai" | "url" | "rss" | "text"
    sourceUrl: string
    providers: NewsCreatorProps["providers"]
    selectedProvider: string
    onProviderChange: (id: string) => void
    customInstructions: string
    setCustomInstructions: (instructions: string) => void
    result: NewsCreatorProps["result"]
    generatedArticle: NewsCreatorProps["generatedArticle"]
    isGenerating: boolean
    onGenerate: (customInstructions?: string) => void
    onBack: () => void
}) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Pregledajte i stvorite</h2>
                <p className="text-muted-foreground">Provjerite postavke i pokrenite generiranje</p>
            </div>

            {/* Summary Card */}
            <div className={`${theme.section} space-y-4`}>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Sažetak
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Tema</p>
                        <p className="font-medium flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: selectedTopicData?.color }}
                            />
                            {selectedTopicData?.name || "Nije odabrano"}
                        </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Izvor</p>
                        <p className="font-medium">
                            {newsSource === "ai" && "AI generira sadržaj"}
                            {newsSource === "url" && `Web: ${sourceUrl.substring(0, 30)}...`}
                            {newsSource === "text" && "Tekst koji ste unijeli"}
                            {newsSource === "rss" && "RSS feed"}
                        </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">AI Model</p>
                        <div className="relative">
                            <select
                                value={selectedProvider}
                                onChange={(e) => onProviderChange(e.target.value)}
                                className="w-full appearance-none bg-transparent font-medium cursor-pointer pr-8"
                            >
                                {providers.filter(p => p.is_active).map((provider) => (
                                    <option key={provider.id} value={provider.id}>
                                        {provider.display_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Jezik</p>
                        <p className="font-medium">Hrvatski 🇭🇷</p>
                    </div>
                </div>
            </div>

            {/* Custom Instructions */}
            <div className={`${theme.section}`}>
                <label className="block font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Posebne upute (opcionalno)
                </label>
                <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Npr. 'Napiši u formalnijem tonu' ili 'Dodaj statistiku ako je relevantno'..."
                    className={`w-full px-4 py-3 min-h-[100px] ${theme.input}`}
                />
                <p className="text-xs text-muted-foreground mt-2">
                    Ovdje možete dodati posebne napomene za AI, poput tona pisanja ili specifičnih zahtjeva
                </p>
            </div>

            {/* Result Message */}
            {result && (
                <div className={`p-4 ${result.success ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "bg-red-50 dark:bg-red-900/20 border-red-200"} brutalist-border`}>
                    <p className={`font-medium ${result.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
                        {result.success ? "✓ " : "✗ "}{result.message}
                    </p>
                </div>
            )}

            {/* Generated Article Preview */}
            {generatedArticle && (
                <div className={`${theme.section} space-y-4`}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-green-600" />
                            Generirana vijest
                        </h3>
                        <a
                            href={`/article/${generatedArticle.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                            Otvori članak <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xl font-bold">{generatedArticle.title}</h4>
                        <p className="text-muted-foreground italic">{generatedArticle.excerpt}</p>
                        <div className="p-4 bg-muted/30 rounded-lg prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: generatedArticle.content.replace(/\n/g, '<br/>') }} />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => window.open(`/admin/articles/${generatedArticle.id}`, '_blank')}
                            className="flex-1"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Uredi članak
                        </Button>
                        <Button
                            onClick={() => onGenerate(customInstructions)}
                            className={`flex-1 ${theme.buttonPrimary}`}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generiraj novu
                        </Button>
                    </div>
                </div>
            )}

            {/* Action Buttons - only show if no article yet */}
            {!generatedArticle && (
                <div className="flex gap-4">
                    <Button variant="outline" onClick={onBack} className="flex-1">
                        ← Natrag
                    </Button>
                    <Button
                        onClick={() => onGenerate(customInstructions)}
                        disabled={isGenerating || !selectedProvider}
                        className={`flex-[2] py-6 text-lg font-bold ${theme.buttonPrimary}`}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                AI piše vijest...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5 mr-2" />
                                Stvori vijest
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Help */}
            <div className="text-center">
                <button className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    Trebate pomoć?
                </button>
            </div>
        </div>
    )
}
