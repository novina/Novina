"use client"

interface NovinaMascotProps {
  mood?: "default" | "alert" | "think" | "create" | "experiment" | "future" | "happy" | "curious"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  animate?: boolean
}

export function NovinaMascot({ mood = "default", size = "md", className = "", animate = true }: NovinaMascotProps) {
  const sizes = {
    sm: { width: 32, height: 40 },
    md: { width: 48, height: 60 },
    lg: { width: 72, height: 90 },
    xl: { width: 120, height: 150 },
  }

  const { width, height } = sizes[size]

  // Different poses/expressions based on mood
  const getMoodConfig = () => {
    switch (mood) {
      case "alert":
        return { headRotate: -15, eyeScale: 1.3, lampAngle: -30, color: "#FF6B35" }
      case "think":
        return { headRotate: 20, eyeScale: 0.8, lampAngle: 15, color: "#4ECDC4" }
      case "create":
        return { headRotate: 0, eyeScale: 1.1, lampAngle: -20, color: "#FFE66D" }
      case "experiment":
        return { headRotate: -10, eyeScale: 1.2, lampAngle: -45, color: "#95E1D3" }
      case "future":
        return { headRotate: 25, eyeScale: 0.9, lampAngle: 30, color: "#F38181" }
      case "happy":
        return { headRotate: 5, eyeScale: 1.0, lampAngle: 0, color: "#FFE66D" }
      case "curious":
        return { headRotate: -25, eyeScale: 1.4, lampAngle: -50, color: "#4ECDC4" }
      default:
        return { headRotate: 0, eyeScale: 1.0, lampAngle: 0, color: "#FF6B35" }
    }
  }

  const config = getMoodConfig()

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animate ? "transition-transform duration-300" : ""} ${className}`}
      aria-label={`Novina mascot - ${mood} mood`}
    >
      {/* Base/Stand */}
      <ellipse cx="24" cy="57" rx="14" ry="3" fill="currentColor" opacity="0.2" />
      <rect x="20" y="48" width="8" height="10" rx="1" fill="currentColor" />

      {/* Arm/Neck */}
      <g transform={`rotate(${config.lampAngle} 24 48)`}>
        <rect x="22" y="26" width="4" height="24" rx="2" fill="currentColor" />

        {/* Joint */}
        <circle cx="24" cy="26" r="3" fill={config.color} />

        {/* Head/Lamp shade */}
        <g transform={`rotate(${config.headRotate} 24 16)`}>
          {/* Lamp cone */}
          <path d="M12 20 L24 8 L36 20 Z" fill={config.color} stroke="currentColor" strokeWidth="2" />

          {/* Face plate */}
          <rect x="16" y="14" width="16" height="8" rx="2" fill="currentColor" />

          {/* Eye */}
          <circle
            cx="24"
            cy="18"
            r={3 * config.eyeScale}
            fill={config.color}
            className={animate ? "animate-pulse" : ""}
          />

          {/* Eye shine */}
          <circle cx={25 + (config.headRotate > 0 ? 1 : -1)} cy="17" r={1 * config.eyeScale} fill="white" />

          {/* Antenna */}
          <line x1="24" y1="8" x2="24" y2="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="3" r="2" fill={config.color} />
        </g>
      </g>

      {/* Light beam (visible in some moods) */}
      {(mood === "create" || mood === "experiment") && (
        <path
          d="M18 22 L12 35 L36 35 L30 22"
          fill={config.color}
          opacity="0.2"
          className={animate ? "animate-pulse" : ""}
        />
      )}
    </svg>
  )
}
