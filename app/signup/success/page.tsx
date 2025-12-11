import { NovinaLogo } from "@/components/novina-logo"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md text-center">
        <NovinaLogo size="lg" mood="happy" />

        <div className="mt-8 brutalist-border brutalist-shadow bg-card p-8">
          <h1 className="text-2xl font-black mb-4">Dobrodošao/la!</h1>
          <p className="text-muted-foreground mb-6">
            Poslali smo ti email za potvrdu. Klikni na link u emailu da aktiviraš svoj račun.
          </p>

          <div className="p-4 bg-accent/20 brutalist-border">
            <p className="text-sm font-mono">// Provjeri spam folder ako ne vidiš email</p>
          </div>
        </div>

        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
        >
          Natrag na prijavu
        </Link>
      </div>
    </div>
  )
}
