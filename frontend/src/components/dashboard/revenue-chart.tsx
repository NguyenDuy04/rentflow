"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRevenueChart } from "@/hooks/use-dashboard";
import { formatCurrency, monthLabel } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export function RevenueChart() {
    const [months, setMonths] = useState<6 | 12>(6);
    const { data, isLoading } = useRevenueChart(months);
    const t = useTranslations("dashboard.revenueChart");
    const locale = useLocale();

    const chartData = (data || []).map((d) => ({ ...d, label: monthLabel(d.month, locale) }));

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{t("title")}</CardTitle>
                <div className="flex gap-1"> {[6, 12].map((m) => (
                    <Button key={m} size="sm" variant={months === m ? "default" : "outline"} onClick={() => setMonths(m as 6 | 12)}>
                        {t("months", { value: m })}
                    </Button>
                ))}
                </div>
            </CardHeader>
            <CardContent className="pl-0">
                {isLoading
                    ?
                    (<Skeleton className="ml-5 h-64 w-[95%]" />)
                    :
                    (<ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} fontSize={12} width={70} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}${t("millionShort")}`} />
                            <Tooltip
                                formatter={(value) => [
                                    formatCurrency(Number(value), locale),
                                    t("revenue"),
                                ]}
                                contentStyle={
                                    { borderRadius: 8, borderColor: "var(--chart-tooltip-border)", fontSize: 13, }
                                } />
                            <Area type="monotone" dataKey="revenue" stroke="var(--chart-primary)" strokeWidth={2} fill="url(#revenueFill)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    )}
            </CardContent>
        </Card>
    );
}
