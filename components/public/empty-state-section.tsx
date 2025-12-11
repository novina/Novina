import { NovinaMascot } from "@/components/novina-mascot"

interface EmptyStateSectionProps {
  mood?: "curious" | "happy" | "think" | "alert" | "create" | "experiment" | "future"
  message: string
}

export function EmptyStateSection({ mood = "curious", message }: EmptyStateSectionProps) {
  return (
    <div className="brutalist-border brutalist-shadow bg-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
      <NovinaMascot mood={mood} size="lg" />
      <div className="text-center md:text-left">
        <p className="text-lg text-muted-foreground">{message}</p>
        <p className="mt-2 text-sm font-mono text-muted-foreground/70">STATUS: PREPARING CONTENT...</p>
      </div>
    </div>
  )
}
