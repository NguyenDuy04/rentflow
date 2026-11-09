"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Zap } from "lucide-react";

import { useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { createMeterSchema, type MeterFormInput, type MeterInput } from "@/schemas/meter";
import { useCreateMeter, useMeters } from "@/hooks/use-meters";
import { useRooms } from "@/hooks/use-rooms";
import { ApiError } from "@/lib/api-client";
import { currentMonth } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function MeterForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations("meters.form");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const meterSchema = createMeterSchema({
    requiredRoom: validation("requiredRoom"),
    requiredMonth: validation("requiredMonth"),
    invalidReading: validation("invalidReading"),
    electricityReadingOrder: validation("electricityReadingOrder"),
    waterReadingOrder: validation("waterReadingOrder"),
  });
  const { data: rooms } = useRooms();
  const createMeter = useCreateMeter();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MeterFormInput, unknown, MeterInput>({
    resolver: zodResolver(meterSchema),
    defaultValues: {
      room_id: "",
      month: currentMonth(),
      electricity_old: 0,
      electricity_new: 0,
      water_old: 0,
      water_new: 0,
    },
  });

  const selectedRoomId = useWatch({
    control,
    name: "room_id",
  });
  const { data: history } = useMeters(selectedRoomId ? { room_id: selectedRoomId } : undefined);

  // Convenience: when a room is picked, suggest last month's "new" reading as
  // this month's "old" reading, since that's true 99% of the time.
  useEffect(() => {
    if (!selectedRoomId || !history || history.length === 0) return;
    const latest = [...history].sort((a, b) => b.month.localeCompare(a.month))[0];
    setValue("electricity_old", latest.electricity_new);
    setValue("water_old", latest.water_new);
  }, [selectedRoomId, history, setValue]);

  const roomOptions = (rooms || []).map((r) => ({ value: r.id, label: `${r.room_code} - ${r.name}` }));

  const onSubmit = (data: MeterInput) => {
    createMeter.mutate(data, {
      onSuccess: () => {
        toast.success(t("saved"));
        onSuccess();
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="room_id">{t("room")}</Label>
          <Select id="room_id" placeholder={t("chooseRoom")} options={roomOptions} {...register("room_id")} />
          {errors.room_id && <p className="text-xs text-destructive">{errors.room_id.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="month">{t("month")}</Label>
          <Input id="month" type="month" {...register("month")} />
        </div>
      </div>

      {selectedRoomId && history && history.length > 0 && (
        <p className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          <Zap className="h-3.5 w-3.5" /> {t("autoFilled")}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="electricity_old">{t("electricityOld")}</Label>
          <Input id="electricity_old" type="number" step="1" {...register("electricity_old")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="electricity_new">{t("electricityNew")}</Label>
          <Input id="electricity_new" type="number" step="1" {...register("electricity_new")} />
          {errors.electricity_new && <p className="text-xs text-destructive">{errors.electricity_new.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="water_old">{t("waterOld")}</Label>
          <Input id="water_old" type="number" step="1" {...register("water_old")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="water_new">{t("waterNew")}</Label>
          <Input id="water_new" type="number" step="1" {...register("water_new")} />
          {errors.water_new && <p className="text-xs text-destructive">{errors.water_new.message}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={createMeter.isPending}>
          {createMeter.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </DialogFooter>
    </form>
  );
}
