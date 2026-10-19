"use client";

import { Link } from "@/i18n/navigation";
import { AlertTriangle, CalendarClock, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardAlerts } from "@/hooks/use-dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export function AlertsPanel() {
    const t = useTranslations("dashboard.alerts");
    const locale = useLocale();
    const { data, isLoading } = useDashboardAlerts();
    const hasAlerts = data && (data.overdue_bills.length > 0 || data.expiring_contracts.length > 0 || data.maintenance_rooms.length > 0);
    const alerts = [
        ...(data?.overdue_bills ?? []).map((bill) => ({
            id: bill._id,
            kind: "bill" as const,
            timestamp: bill.created_at,
            value: bill,
        })),
        ...(data?.expiring_contracts ?? []).map((tenant) => ({
            id: tenant._id,
            kind: "contract" as const,
            timestamp: tenant.updated_at,
            value: tenant,
        })),
        ...(data?.maintenance_rooms ?? []).map((room) => ({
            id: room._id,
            kind: "maintenance" as const,
            timestamp: room.updated_at,
            value: room,
        })),
    ].sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));

    return (
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                {isLoading
                    ?
                    (<div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>)
                    :
                    !hasAlerts
                        ?
                        (<p className="text-sm text-muted-foreground"> {t("noAlerts")} </p>)
                        :
                        (alerts.map((alert) => {
                            if (alert.kind === "bill") {
                                return (
                                    <Link key={`bill-${alert.id}`} href="/billing" className="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm hover:bg-destructive/10">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                        <div>
                                            <p className="font-medium">{t("overdueBill", { billCode: alert.value.bill_code })}</p>
                                            <p className="text-xs text-muted-foreground">{formatCurrency(alert.value.total_amount, locale)} · {t("dueDate", { date: formatDate(alert.value.due_date, locale) })}</p>
                                        </div>
                                    </Link>
                                );
                            }
                            if (alert.kind === "contract") {
                                return (
                                    <Link key={`contract-${alert.id}`} href="/tenants" className="flex items-start gap-3 rounded-md border border-accent/30 bg-accent/10 p-3 text-sm hover:bg-accent/20">
                                        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                                        <div>
                                            <p className="font-medium">{t("contractExpiring", { fullName: alert.value.full_name })}</p>
                                            <p className="text-xs text-muted-foreground">{t("contractEndDate", { date: formatDate(alert.value.lease_end_date!, locale) })}</p>
                                        </div>
                                    </Link>
                                );
                            }
                            return (
                                <Link key={`maintenance-${alert.id}`} href="/rooms" className="flex items-start gap-3 rounded-md border border-border bg-muted/50 p-3 text-sm hover:bg-muted">
                                    <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{t("roomMaintenance", { roomName: alert.value.name })}</p>
                                        <p className="text-xs text-muted-foreground">{t("roomCode", { roomCode: alert.value.room_code })}</p>
                                    </div>
                                </Link>
                            );
                        }))}
            </CardContent>
        </Card>);
}
