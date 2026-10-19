'use client'

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const t = useTranslations("dashboard.header");
    const isDark = theme === "dark";
    const label = isDark ? t("lightTheme") : t("darkTheme");

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}