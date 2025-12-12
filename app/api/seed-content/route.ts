import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Sample articles data - current and relevant tech/AI news
const sampleArticles = [
    {
        title: "Google predstavio Gemini 2.0 - nova era multimodalnog AI-ja",
        slug: "google-gemini-2-nova-era-multimodalnog-ai",
        excerpt: "Google je lansirao Gemini 2.0, svoj najnapredniji AI model koji donosi revolucionarne sposobnosti u razumijevanju slika, videa i teksta.",
        content: `# Google predstavio Gemini 2.0

Google je službeno predstavio **Gemini 2.0**, najnoviju generaciju svog multimodalnog AI modela koji obećava transformirati način na koji interagiramo s tehnologijom.

## Ključne novosti

Gemini 2.0 donosi značajna poboljšanja u nekoliko ključnih područja:

- **Multimodalno razumijevanje** - Model može istovremeno procesirati tekst, slike, audio i video
- **Project Astra** - Novi AI asistent koji vidi i razumije svijet oko vas u realnom vremenu
- **Poboljšano rezoniranje** - Bolje logičko zaključivanje i rješavanje kompleksnih problema

## Što to znači za developere?

API je dostupan putem Google AI Studio i Vertex AI. Cijena ostaje kompetitivna, a performanse nadmašuju prethodnu generaciju za 40%.

*Prati Novinu za više AI vijesti.*`,
        article_type: "short_news",
        is_published: true,
        is_featured: true,
        category_slug: "kratke-vijesti"
    },
    {
        title: "OpenAI o3 postiže rekordne rezultate na ARC-AGI benchmarku",
        slug: "openai-o3-arc-agi-benchmark-rezultati",
        excerpt: "Najnoviji OpenAI model o3 pokazuje sposobnosti koje se približavaju ljudskom razumijevanju, postižući 87.5% na notorno teškom ARC-AGI testu.",
        content: `# OpenAI o3 ruši rekorde

OpenAI-jev novi model **o3** postigao je nevjerojatnih 87.5% na ARC-AGI benchmarku - testu koji mjeri sposobnost generalizacije i apstraktnog razmišljanja.

## Zašto je ovo važno?

ARC-AGI (Abstraction and Reasoning Corpus) smatra se jednim od najtežih testova za AI sustave jer zahtijeva:

1. Razumijevanje novih koncepata bez prethodnog treninga
2. Primjenu logike na potpuno nove situacije  
3. Sposobnost apstrakcije koja se približava ljudskom razmišljanju

## Implikacije za budućnost

Dok neki stručnjaci upozoravaju da benchmark nije savršena mjera inteligencije, rezultati sugeriraju značajan napredak prema AGI (Artificial General Intelligence).

> "Ovo je korak bliže strojevima koji mogu razmišljati, ne samo reagirati." - Sam Altman, CEO OpenAI`,
        article_type: "topic_of_day",
        is_published: true,
        is_featured: false,
        category_slug: "tema-dana"
    },
    {
        title: "Anthropic objavio Claude 3.5 Sonnet - najsposobniji model za kodiranje",
        slug: "anthropic-claude-35-sonnet-kodiranje",
        excerpt: "Claude 3.5 Sonnet nadmašuje GPT-4 i Gemini u benchmark testovima za programiranje, uz dvostruko bržu obradu.",
        content: `# Claude 3.5 Sonnet - Novi kralj kodiranja

Anthropic je lansirao **Claude 3.5 Sonnet**, model koji postavlja nove standarde u AI-potpomognutom programiranju.

## Benchmark rezultati

| Model | HumanEval | MBPP | Brzina |
|-------|-----------|------|--------|
| Claude 3.5 Sonnet | 92.0% | 87.5% | 2x brži |
| GPT-4 Turbo | 87.1% | 83.2% | Baseline |
| Gemini Pro | 84.3% | 81.0% | 1.5x brži |

## Praktične prednosti

- **Artifacts** - Mogućnost generiranja i izvršavanja koda u realnom vremenu
- **Computer Use** - Eksperimentalna funkcija za kontrolu računala
- **200K kontekst** - Može analizirati cijele codebases

Claude 3.5 Sonnet dostupan je besplatno na claude.ai uz ograničenja, dok je API cijena $3/million input tokena.`,
        article_type: "short_news",
        is_published: true,
        is_featured: false,
        category_slug: "kratke-vijesti"
    },
    {
        title: "Cursor IDE revolucionira razvoj softvera s AI-first pristupom",
        slug: "cursor-ide-ai-first-razvoj-softvera",
        excerpt: "Cursor, fork VS Code-a s duboko integriranim AI-em, postaje izbor broj jedan za moderne developere.",
        content: `# Cursor - IDE koji razumije vaš kod

**Cursor** je transformirao način na koji developeri pišu kod, kombinirajući poznato VS Code sučelje s moćnim AI mogućnostima.

## Zašto developeri prelaze na Cursor?

### 1. Cmd+K za sve
Označite kod, pritisnite Cmd+K i opišite što želite. Cursor refaktorira, popravlja bugove ili dodaje feature.

### 2. Chat koji razumije projekt
AI asistent vidi cijeli vaš codebase i može odgovarati na pitanja o arhitekturi, predlagati poboljšanja.

### 3. Multi-file editing
Composer mode omogućava promjene kroz više datoteka odjednom - idealno za refaktoring.

## Cijena

- **Free** - 2000 completions mjesečno
- **Pro ($20/mj)** - Neograničeno + pristup najboljim modelima

> "Cursor je promijenio moj workflow. Ono što mi je prije uzimalo sat, sad završim u 10 minuta." - Developer na Reddit-u`,
        article_type: "short_news",
        is_published: true,
        is_featured: false,
        category_slug: "ai-lab"
    },
    {
        title: "EU AI Act stupa na snagu - što to znači za developere?",
        slug: "eu-ai-act-sto-znaci-za-developere",
        excerpt: "Europska regulativa o umjetnoj inteligenciji donosi nova pravila koja će utjecati na sve koji razvijaju ili koriste AI sustave.",
        content: `# EU AI Act - Kompletan vodič

**EU AI Act** je prva sveobuhvatna regulativa o umjetnoj inteligenciji na svijetu. Evo što trebate znati.

## Kategorije rizika

### 🔴 Neprihvatljiv rizik (Zabranjeno)
- Socijalni scoring sustavi
- Manipulativni AI u oglašavanju djece
- Biometrijska identifikacija u realnom vremenu

### 🟠 Visok rizik (Strogi zahtjevi)
- AI u zapošljavanju
- Medicinska dijagnostika
- Kreditni scoring

### 🟡 Ograničen rizik (Transparentnost)
- Chatbotovi
- Generativni AI
- Deepfake detekcija

### 🟢 Minimalan rizik (Bez zahtjeva)
- AI u video igrama
- Spam filteri

## Rokovi

- **Veljača 2025** - Zabrane stupaju na snagu
- **Kolovoz 2025** - Pravila za velike modele
- **2027** - Puna primjena

Kazne mogu doseći do 35 milijuna eura ili 7% globalnog prometa.`,
        article_type: "topic_of_day",
        is_published: true,
        is_featured: false,
        category_slug: "tema-dana"
    }
]

// Sample links data
const sampleLinks = [
    { title: "Anthropic Claude", url: "https://claude.ai", description: "Razgovarajte s Claudeom - AI asistentom koji poštuje sigurnost", category: "AI Alati", is_featured: true },
    { title: "ChatGPT", url: "https://chat.openai.com", description: "OpenAI-jev popularni AI chatbot", category: "AI Alati", is_featured: true },
    { title: "Midjourney", url: "https://www.midjourney.com", description: "Generirajte zadivljujuće slike pomoću AI-ja", category: "AI Kreativnost", is_featured: true },
    { title: "Cursor", url: "https://cursor.com", description: "AI-first IDE koji ubrzava kodiranje", category: "Developer Tools", is_featured: true },
    { title: "v0 by Vercel", url: "https://v0.dev", description: "Pretvorite opis u React komponente", category: "Developer Tools", is_featured: true },
    { title: "Perplexity", url: "https://www.perplexity.ai", description: "AI pretraživač s izvorima", category: "AI Alati", is_featured: true },
    { title: "Hacker News", url: "https://news.ycombinator.com", description: "Tech vijesti i rasprave", category: "Vijesti", is_featured: false },
    { title: "The Verge AI", url: "https://www.theverge.com/ai-artificial-intelligence", description: "AI vijesti od The Verge", category: "Vijesti", is_featured: false },
]

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const results = {
            articles: { created: 0, errors: [] as string[] },
            links: { created: 0, errors: [] as string[] },
        }

        // Get category IDs
        const { data: categories } = await supabase
            .from("categories")
            .select("id, slug")

        const categoryMap = new Map(categories?.map(c => [c.slug, c.id]) || [])

        // Get author ID for Urednik
        const { data: authors } = await supabase
            .from("authors")
            .select("id, name")
            .eq("type", "human")
            .limit(1)

        const editorId = authors?.[0]?.id

        // Create articles
        for (const article of sampleArticles) {
            const categoryId = categoryMap.get(article.category_slug)

            const { error } = await supabase.from("articles").insert({
                title: article.title,
                slug: article.slug,
                excerpt: article.excerpt,
                content: article.content,
                article_type: article.article_type,
                is_published: article.is_published,
                is_featured: article.is_featured,
                published_at: new Date().toISOString(),
                category_id: categoryId,
                author_id: editorId,
                user_id: user.id,
            })

            if (error) {
                if (error.code === "23505") {
                    // Duplicate slug, skip
                    results.articles.errors.push(`Članak "${article.title}" već postoji`)
                } else {
                    results.articles.errors.push(`${article.title}: ${error.message}`)
                }
            } else {
                results.articles.created++
            }
        }

        // Create links
        for (const link of sampleLinks) {
            const { error } = await supabase.from("links").insert({
                title: link.title,
                url: link.url,
                description: link.description,
                category: link.category,
                is_featured: link.is_featured,
                user_id: user.id,
            })

            if (error) {
                results.links.errors.push(`${link.title}: ${error.message}`)
            } else {
                results.links.created++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Kreirano ${results.articles.created} članaka i ${results.links.created} linkova`,
            details: results
        })

    } catch (error) {
        console.error("Error seeding content:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
