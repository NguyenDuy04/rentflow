"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Gauge, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateMeter } from "@/hooks/use-meters";
import { monthLabel } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { MeterReading, Room } from "@/types";
import { useLocale, useTranslations } from "next-intl";

type EditValues = { electricity_old: number; electricity_new: number; water_old: number; water_new: number };

export function MeterTable({
  meters,
  isLoading,
  roomMap,
}: {
  meters: MeterReading[] | undefined;
  isLoading: boolean;
  roomMap: Map<string, Room>;
}) {
  const t = useTranslations("meters.table");
  const formT = useTranslations("meters.form");
  const common = useTranslations("common");
  const locale = useLocale();
  const [editing, setEditing] = useState<MeterReading | null>(null);
  const updateMeter = useUpdateMeter();
  const { register, handleSubmit, reset } = useForm<EditValues>();

  const openEdit = (m: MeterReading) => {
    setEditing(m);
    reset({
      electricity_old: m.electricity_old,
      electricity_new: m.electricity_new,
      water_old: m.water_old,
      water_new: m.water_new,
    });
  };

  const onSubmit = (data: EditValues) => {
    if (!editing) return;
    updateMeter.mutate(
      { id: editing.id, input: data },
      {
        onSuccess: () => {
          toast.success(t("updated"));
          setEditing(null);
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!meters || meters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
        <Gauge className="h-8 w-8" />
        <p>{t("empty")}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("room")}</TableHead>
            <TableHead>{t("month")}</TableHead>
            <TableHead>{t("electricityReadings")}</TableHead>
            <TableHead>{t("electricityUsage")}</TableHead>
            <TableHead>{t("waterReadings")}</TableHead>
            <TableHead>{t("waterUsage")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {meters.map((m) => {
            const room = roomMap.get(m.room_id);
            return (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{room ? `${room.room_code} - ${room.name}` : "—"}</TableCell>
                <TableCell>{monthLabel(m.month, locale)}</TableCell>
                <TableCell>
                  {m.electricity_old} → {m.electricity_new}
                </TableCell>
                <TableCell>{m.electricity_consumption} kWh</TableCell>
                <TableCell>
                  {m.water_old} → {m.water_new}
                </TableCell>
                <TableCell>{m.water_consumption} m³</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editTitle", { month: editing ? monthLabel(editing.month, locale) : "" })}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{formT("electricityOld")}</Label>
                <Input type="number" {...register("electricity_old", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>{formT("electricityNew")}</Label>
                <Input type="number" {...register("electricity_new", { valueAsNumber: true })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{formT("waterOld")}</Label>
                <Input type="number" {...register("water_old", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>{formT("waterNew")}</Label>
                <Input type="number" {...register("water_new", { valueAsNumber: true })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMeter.isPending}>
                {updateMeter.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {common("saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
