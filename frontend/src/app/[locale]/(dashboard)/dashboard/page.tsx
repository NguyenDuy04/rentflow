import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
    const t = useTranslations("dashboard");
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{t("overviews")}</h1>
                <p className="text-sm text-muted-foreground">{t("operational-rental")}</p>
            </div>

            <OverviewCards />

            <div className="grid grid-cols-1 gap-4 lg:auto-rows-85 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RevenueChart />
                </div>
                <AlertsPanel />
            </div>

            <RecentActivities />
        </div>
    );
}