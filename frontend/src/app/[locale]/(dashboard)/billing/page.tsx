"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useBills } from "@/hooks/use-bills";
import { useRooms } from "@/hooks/use-rooms";
import { useMe } from "@/hooks/use-auth";
import { BillTable } from "@/components/billing/bill-table";
import { GenerateBillDialog } from "@/components/billing/generate-bill-dialog";
import { currentMonth } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function BillingPage() {
  const t = useTranslations("billing");
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const { data: user } = useMe();
  const { data: rooms } = useRooms();
  const { data: bills, isLoading } = useBills({ month: month || undefined, status: status || undefined });

  const roomMap = new Map((rooms || []).map((r) => [r.id, r]));
  const statusOptions = [
    { value: "unpaid", label: t("status.unpaid") },
    { value: "paid", label: t("status.paid") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {user?.role === "owner" && (
          <Button onClick={() => setGenerateOpen(true)}>
            <Plus className="h-4 w-4" /> {t("create")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row h-11">
        <Input type="month" className="sm:w-40 h-full" value={month} onChange={(e) => setMonth(e.target.value)} />
        <Select
          className="sm:w-48 h-full"
          placeholder={t("allStatuses")}
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>

      <Card>
        <BillTable bills={bills} isLoading={isLoading} roomMap={roomMap} />
      </Card>

      {user?.role === "owner" && <GenerateBillDialog open={generateOpen} onOpenChange={setGenerateOpen} />}
    </div>
  );
}
