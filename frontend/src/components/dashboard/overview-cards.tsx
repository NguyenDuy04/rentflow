"use client";

import { Building2, DoorOpen, Wallet, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export function OverviewCards() {
    const { data, isLoading } = useDashboardOverview();
    const t = useTranslations("dashboard.overview");
    const locale = useLocale();

    const items = [
        {
            label: t("totalRooms"),
            value: data ? `${data.total_rooms}` : undefined,
            sub: data
                ? `${data.occupied_rooms} ${t("occupied")} · ${data.vacant_rooms} ${t("vacant")}`
                : undefined,
            icon: Building2,
        },
        {
            label: t("occupancyRate"),
            value: data ? `${data.occupancy_rate}%` : undefined,
            sub: data
                ? `${data.maintenance_rooms} ${t("maintenanceRooms")}`
                : undefined,
            icon: DoorOpen,
        },
        {
            label: t("monthlyRevenue"),
            value: data ? formatCurrency(data.current_month_revenue, locale) : undefined,
            sub: t("receivedPayments"),
            icon: Wallet,
        },
        {
            label: t("unpaidBills"),
            value: data ? `${data.unpaid_bills_count}` : undefined,
            sub: t("paymentReminder"),
            icon: AlertCircle,
            alert: (data?.unpaid_bills_count ?? 0) > 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.label} className="gap-0 py-3">
                    <CardContent className="flex items-start justify-between px-3">
                        <div className="space-y-1 w-full">
                            <div className="flex items-center gap-2 pb-1.5">
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.alert ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
                                        }`}>
                                    <item.icon className="h-4.5 w-4.5" />
                                </div>
                                <p className="text-[16px] text-muted-foreground">{item.label}</p>
                            </div>
                            {isLoading || item.value === undefined ? (
                                <Skeleton className="h-7 w-24" />
                            ) : (
                                <p className="text-[26px] font-semibold tracking-tight pb-1 pl-1">{item.value}</p>
                            )}
                            {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
