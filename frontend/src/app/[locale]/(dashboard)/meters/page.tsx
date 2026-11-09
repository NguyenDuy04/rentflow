"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMeters } from "@/hooks/use-meters";
import { useRooms } from "@/hooks/use-rooms";
import { MeterTable } from "@/components/meters/meter-table";
import { MeterForm } from "@/components/meters/meter-form";
import { useTranslations } from "next-intl";

export default function MetersPage() {
  const t = useTranslations("meters");
  const [month, setMonth] = useState("");
  const [roomId, setRoomId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data: rooms } = useRooms();
  const { data: meters, isLoading } = useMeters({
    month: month || undefined,
    room_id: roomId || undefined,
  });

  const roomMap = new Map((rooms || []).map((r) => [r.id, r]));
  const roomOptions = (rooms || []).map((r) => ({ value: r.id, label: `${r.room_code} - ${r.name}` }));
  const monthOptions = last12Months().map((m) => ({ value: m, label: m }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> {t("addReading")}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          className="sm:w-56"
          placeholder={t("allRooms")}
          options={roomOptions}
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <Select
          className="sm:w-40"
          placeholder={t("allMonths")}
          options={monthOptions}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <Card>
        <MeterTable meters={meters} isLoading={isLoading} roomMap={roomMap} />
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addTitle")}</DialogTitle>
          </DialogHeader>
          <MeterForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function last12Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}
