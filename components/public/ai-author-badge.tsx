import type { Author } from "@/lib/types"
import { Sparkles, Brain, Zap, Circle } from "lucide-react"

interface AIAuthorBadgeProps {
    author: Author
    size?: "sm" | "md" | "lg"
}

const aiColors = {
    claude: {
        bg: "bg-orange-100 dark:bg-orange-950/30",
        text: "text-orange-700 dark:text-orange-400",
        border: "border-orange-300 dark:border-orange-700",
        icon: Brain,
    },
    gemini: {
        bg: "bg-blue-100 dark:bg-blue-950/30",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-700",
        icon: Sparkles,
    },
    chatgpt: {
        bg: "bg-green-100 dark:bg-green-950/30",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-300 dark:border-green-700",
        icon: Zap,
    },
    grok: {
        bg: "bg-purple-100 dark:bg-purple-950/30",
        text: "text-purple-700 dark:text-purple-400",
        border: "border-purple-300 dark:border-purple-700",
        icon: Circle,
    },
}

export function AIAuthorBadge({ author, size = "md" }: AIAuthorBadgeProps) {
    // Only show badge for AI authors
    if (author.type === "human") {
        return null
    }

    const config = aiColors[author.type] || aiColors.claude
    const Icon = config.icon

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
    }

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    }

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded font-mono font-medium border-2 ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
        >
            <Icon className={iconSizes[size]} />
            <span>{author.name}</span>
        </div>
    )
}
