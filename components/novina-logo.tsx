import { NovinaMascot } from "./novina-mascot"

interface NovinaLogoProps {
  size?: "sm" | "md" | "lg"
  showMascot?: boolean
  mood?: "default" | "alert" | "think" | "create" | "experiment" | "future" | "happy" | "curious"
}

export function NovinaLogo({ size = "md", showMascot = true, mood = "default" }: NovinaLogoProps) {
  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  }

  const mascotSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
  }

  return (
    <div className="flex items-center gap-2">
      {showMascot && <NovinaMascot mood={mood} size={mascotSizes[size]} />}
      <span className={`font-sans font-black tracking-tight ${textSizes[size]}`}>NOVINA</span>
    </div>
  )
}
