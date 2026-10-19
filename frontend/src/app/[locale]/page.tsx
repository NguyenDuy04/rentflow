'use client'

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api-client"
import type { User } from "@/types";

export default function RootPage() {
    const router = useRouter();
    const t = useTranslations("app");

    useEffect(() => {
        let cancelled = false;

        async function decide() {
            try {
                const user = await api.get<User>("/auth/me");
                if (!cancelled) router.replace(user.role === "tenant" ? "/tenant" : "/dashboard");
            } catch {
                try {
                    const status = await api.get<{ needs_setup: boolean }>("/auth/setup-status");
                    if (!cancelled) router.replace(status.needs_setup ? "/register" : "/login");
                } catch {
                    if (!cancelled) router.replace("/login");
                }
            }
        }

        decide();
        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <main
            className="flex min-h-screen items-center justify-center bg-background"
            role="status"
            aria-label={t("loading")}>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">{t("loading")}</span>
            </div>
        </main>
    );
}