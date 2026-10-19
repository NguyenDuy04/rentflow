"use client";

import { UserPlus, Wallet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentActivities } from "@/hooks/use-dashboard";
import { formatDateTime } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

const ICONS = { new_tenant: UserPlus, new_payment: Wallet, new_bill: Receipt } as const;

export function RecentActivities() {
    const { data, isLoading } = useRecentActivities();
    const t = useTranslations("dashboard.recentActivities");
    const locale = useLocale();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading
                    ?
                    (<div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>)
                    :
                    !data || data.length === 0
                        ?
                        (<p className="text-sm text-muted-foreground"> {t("empty")} </p>)
                        :
                        (data.map((activity, idx) => {
                            const Icon = ICONS[activity.type];
                            return (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate"> {activity.description} </p>
                                        <p className="text-xs text-muted-foreground"> {formatDateTime(activity.timestamp, locale)} </p>
                                    </div>
                                </div>
                            );
                        }))
                }
            </CardContent>
        </Card>
    );
}
