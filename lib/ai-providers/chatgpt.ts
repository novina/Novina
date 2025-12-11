import { OpenRouterClient } from "./openrouter"
import type { AIProvider, NewsArticle } from "./types"

const NEWS_PROMPT = `Generiraj jednu kratku vijest iz svijeta tehnologije i umjetne inteligencije.

Vijest treba biti:
- Aktuelna i relevantna za Tech/AI zajednicu
- Napisana na hrvatskom jeziku
- Dužine 100-150 riječi
- U informativnom ali angažiranom tonu
- Fokusirana na jedan konkretan događaj ili najavu

Odgovori ISKLJUČIVO u JSON formatu:
{
  "title": "Naslov vijesti (max 80 znakova)",
  "excerpt": "Kratak sažetak (max 120 znakova)",
  "content": "Puni tekst vijesti u Markdown formatu"
}

Nemoj dodavati nikakve dodatne komentare, samo JSON.`

export class ChatGPTProvider implements AIProvider {
    name = "ChatGPT"
    private client: OpenRouterClient

    constructor() {
        this.client = new OpenRouterClient("openai/gpt-4o")
    }

    async generateNews(): Promise<NewsArticle> {
        return this.client.generateNews(NEWS_PROMPT)
    }
}
