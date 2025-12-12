import { getHomePageData } from "@/lib/queries"
import { PublicHeader } from "@/components/public/public-header"
import { HeroSection } from "@/components/public/hero-section"
import { NewsWithTweetsGrid } from "@/components/public/news-with-tweets-grid"
import { TopicOfDay } from "@/components/public/topic-of-day"
import { IllustrationOfDay } from "@/components/public/illustration-of-day"
import { LinkVault } from "@/components/public/link-vault"
import { PublicFooter } from "@/components/public/public-footer"
import { FunnyBanner } from "@/components/public/funny-banner"
import { EmptyStateSection } from "@/components/public/empty-state-section"

export default async function HomePage() {
  // Single optimized query - sve u jednom pozivu, cacheirano
  const { featuredArticle, shortNews, topicOfDay, illustrationOfDay, links, tweets } = await getHomePageData()

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {/* Hero Section */}
        <HeroSection article={featuredArticle} />

        {/* Funny Banner */}
        <FunnyBanner />

        {/* News Grid with Tweets */}
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                <span className="w-3 h-3 bg-primary"></span>
                Vijesti
              </h2>
              <p className="text-sm text-muted-foreground italic ml-6">// Brzo, precizno, bez vode. Jer tvoje vrijeme je vrijedno.</p>
            </div>
            <NewsWithTweetsGrid articles={shortNews} tweets={tweets} />
          </div>
        </section>

        {/* Topic of the Day */}
        <section className="py-12 px-4 md:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                <span className="w-3 h-3 bg-secondary"></span>
                Tema dana
              </h2>
              <p className="text-sm text-muted-foreground italic ml-6">// Dubinska analiza. Jer ponekad TL;DR nije dovoljno.</p>
            </div>
            {topicOfDay ? (
              <TopicOfDay article={topicOfDay} />
            ) : (
              <EmptyStateSection
                mood="think"
                message="Urednik još bira temu dana. Ako je vjerovati glasinama, bit će zanimljivo."
              />
            )}
          </div>
        </section>

        {/* Illustration of the Day */}
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                <span className="w-3 h-3 bg-accent"></span>
                Ilustracija dana
              </h2>
              <p className="text-sm text-muted-foreground italic ml-6">// Slika vrijedi 1000 riječi. AI to shvaća doslovno.</p>
            </div>
            {illustrationOfDay ? (
              <IllustrationOfDay article={illustrationOfDay} />
            ) : (
              <EmptyStateSection
                mood="create"
                message="AI upravo slika. Možda nešto apstraktno, možda robota koji pije kavu. Tko zna."
              />
            )}
          </div>
        </section>

        {/* Link Vault */}
        <section className="py-12 px-4 md:px-8 bg-foreground text-background">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                <span className="w-3 h-3 bg-primary"></span>
                Link trezor
              </h2>
              <p className="text-background/70 italic ml-6 text-sm">
                // Kurirani linkovi. Svaki testiran. Urednik je kliknuo na svaki. Dvaput.
              </p>
            </div>
            <LinkVault links={links} />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
