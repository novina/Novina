/**
 * Novina Admin Theme Configuration
 * 
 * Centralized theming system for consistent styling across admin panels.
 * Future: Can extend to support multiple themes like WordPress.
 */

export type AdminTheme = "brutalist" | "glass" | "minimal"

// Current active theme
export const CURRENT_THEME: AdminTheme = "brutalist"

// Theme-specific CSS class mappings
export const themeClasses = {
    brutalist: {
        card: "brutalist-border brutalist-shadow bg-card",
        cardHover: "brutalist-hover",
        cardActive: "brutalist-border bg-primary text-primary-foreground",
        button: "brutalist-border brutalist-shadow brutalist-hover",
        buttonPrimary: "brutalist-border brutalist-shadow brutalist-hover bg-primary text-primary-foreground",
        buttonAccent: "brutalist-border brutalist-shadow brutalist-hover bg-accent text-accent-foreground",
        input: "brutalist-border bg-card focus:ring-2 focus:ring-primary",
        section: "brutalist-border bg-card p-6",
        divider: "border-b-3 border-foreground",
        tabs: "brutalist-border bg-card",
        tabActive: "bg-primary text-primary-foreground brutalist-border",
        tabInactive: "hover:bg-muted",
        badge: "brutalist-border text-xs px-2 py-0.5 font-mono",
        badgeSuccess: "bg-novina-mint",
        badgeWarning: "bg-novina-yellow",
        badgeError: "bg-novina-coral",
        empty: "brutalist-border p-12 text-center bg-muted/30",
    },
    glass: {
        card: "bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-900/80 dark:to-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50 shadow-xl rounded-2xl",
        cardHover: "hover:shadow-2xl hover:scale-[1.02] transition-all duration-300",
        cardActive: "ring-2 ring-primary",
        button: "rounded-xl transition-all duration-300",
        buttonPrimary: "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white rounded-xl",
        buttonAccent: "bg-accent/80 backdrop-blur rounded-xl",
        input: "rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary",
        section: "bg-gradient-to-br from-white/60 to-white/40 dark:from-zinc-900/60 dark:to-zinc-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6",
        divider: "border-b border-border/50",
        tabs: "bg-white/50 dark:bg-zinc-900/50 backdrop-blur rounded-2xl p-2",
        tabActive: "bg-primary text-primary-foreground rounded-xl shadow-lg",
        tabInactive: "hover:bg-muted/50 rounded-xl",
        badge: "rounded-full text-xs px-3 py-1 font-medium",
        badgeSuccess: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        badgeWarning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        badgeError: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        empty: "rounded-2xl p-12 text-center bg-muted/30 backdrop-blur",
    },
    minimal: {
        card: "border rounded-lg bg-card",
        cardHover: "hover:border-primary transition-colors",
        cardActive: "border-primary bg-primary/5",
        button: "rounded-lg",
        buttonPrimary: "bg-primary text-primary-foreground rounded-lg",
        buttonAccent: "bg-accent text-accent-foreground rounded-lg",
        input: "rounded-lg border focus:ring-2 focus:ring-primary",
        section: "border rounded-lg bg-card p-6",
        divider: "border-b",
        tabs: "border-b",
        tabActive: "border-b-2 border-primary text-primary",
        tabInactive: "hover:text-primary",
        badge: "rounded text-xs px-2 py-1",
        badgeSuccess: "bg-green-100 text-green-700",
        badgeWarning: "bg-yellow-100 text-yellow-700",
        badgeError: "bg-red-100 text-red-700",
        empty: "border rounded-lg p-12 text-center",
    },
}

// Get current theme classes
export function getTheme() {
    return themeClasses[CURRENT_THEME]
}

// Shorthand for common patterns
export const theme = getTheme()
