"use client";

import { useState } from "react";
import { CalendarDays, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePayments } from "@/hooks/use-payments";
import { useBills } from "@/hooks/use-bills";
import { useRooms } from "@/hooks/use-rooms";
import { useTenants } from "@/hooks/use-tenants";
import { Card } from "@/components/ui/card";
import { PaymentTable } from "@/components/payments/payment-table";
import { formatCurrency } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

type PeriodFilter = "all" | "thisMonth" | "last30Days" | "customMonth";

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const methodT = useTranslations("payments.method");
  const locale = useLocale();
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [customMonth, setCustomMonth] = useState("");
  const [method, setMethod] = useState("");
  const [search, setSearch] = useState("");
  const { data: payments, isLoading } = usePayments();
  const { data: bills } = useBills();
  const { data: rooms } = useRooms();
  const { data: tenants } = useTenants();

  const billMap = new Map((bills || []).map((b) => [b.id, b]));
  const roomMap = new Map((rooms || []).map((r) => [r.id, r]));
  const tenantMap = new Map((tenants || []).map((tenant) => [tenant.id, tenant]));
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);
  const filteredPayments = (payments || []).filter((payment) => {
    if (method && payment.method !== method) return false;
    const paymentDate = new Date(payment.payment_date);
    if (period === "thisMonth" && !payment.payment_date.startsWith(thisMonth)) return false;
    if (period === "last30Days" && paymentDate < last30Days) return false;
    if (period === "customMonth" && !payment.payment_date.startsWith(customMonth)) return false;
    if (!normalizedSearch) return true;

    const bill = billMap.get(payment.bill_id);
    const room = bill ? roomMap.get(bill.room_id) : undefined;
    const tenant = bill?.tenant_id ? tenantMap.get(bill.tenant_id) : undefined;
    const searchable = [
      bill?.bill_code,
      room?.room_code,
      room?.name,
      tenant?.full_name,
      tenant?.phone,
      payment.transaction_code,
      payment.amount,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return searchable.includes(normalizedSearch);
  });
  const totalAmount = filteredPayments.reduce((total, payment) => total + payment.amount, 0);
  const hasFilters = Boolean(period !== "all" || method || normalizedSearch);
  const clearFilters = () => {
    setSearch("");
    setPeriod("all");
    setCustomMonth("");
    setMethod("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <section aria-label={t("filters.searchSection")} className="space-y-4 border-y border-border py-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              aria-label={t("filters.search")}
              placeholder={t("filters.search")}
              className="h-12 pl-10 pr-10 text-base"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("filters.clearSearch")}
                className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="inline-flex h-12 shrink-0 items-center overflow-x-auto rounded-md border border-input bg-background p-1" role="group" aria-label={t("filters.method")}>
            {(["", "cash", "bank_transfer"] as const).map((value) => (
              <Button
                key={value || "all"}
                type="button"
                size="sm"
                variant={method === value ? "secondary" : "ghost"}
                aria-pressed={method === value}
                className="h-9 whitespace-nowrap px-3"
                onClick={() => setMethod(value)}
              >
                {value === "" ? t("filters.allMethods") : methodT(value === "cash" ? "cash" : "bankTransfer")}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label={t("filters.period")}>
            <Button type="button" size="sm" variant={period === "all" ? "secondary" : "ghost"} aria-pressed={period === "all"} onClick={() => { setPeriod("all"); setCustomMonth(""); }}>
              {t("filters.allDates")}
            </Button>
            <Button type="button" size="sm" variant={period === "thisMonth" ? "secondary" : "ghost"} aria-pressed={period === "thisMonth"} onClick={() => { setPeriod("thisMonth"); setCustomMonth(""); }}>
              {t("filters.thisMonth")}
            </Button>
            <Button type="button" size="sm" variant={period === "last30Days" ? "secondary" : "ghost"} aria-pressed={period === "last30Days"} onClick={() => { setPeriod("last30Days"); setCustomMonth(""); }}>
              {t("filters.last30Days")}
            </Button>
            <label className="relative ml-1 flex h-9 items-center gap-2 rounded-md border border-input px-3 text-sm text-muted-foreground focus-within:ring-1 focus-within:ring-ring">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span className="sr-only">{t("filters.month")}</span>
              <input
                aria-label={t("filters.month")}
                type="month"
                value={customMonth}
                className="w-32 bg-transparent text-foreground outline-none"
                onChange={(event) => {
                  setCustomMonth(event.target.value);
                  setPeriod(event.target.value ? "customMonth" : "all");
                }}
              />
            </label>
          </div>
          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={clearFilters}>
              <X className="h-4 w-4" />
              {t("filters.reset")}
            </Button>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "—" : t("summary.matches", { count: filteredPayments.length, total: payments?.length ?? 0 })}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums">
            {isLoading ? "—" : formatCurrency(totalAmount, locale)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{t("summary.total")}</p>
      </div>

      <Card>
        <PaymentTable
          payments={filteredPayments}
          isLoading={isLoading}
          billMap={billMap}
          roomMap={roomMap}
          tenantMap={tenantMap}
          emptyMessage={hasFilters ? t("table.noResults") : undefined}
        />
      </Card>
    </div>
  );
}
