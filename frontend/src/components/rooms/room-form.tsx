"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { createRoomSchema, type RoomFormInput, type RoomInput } from "@/schemas/room";
import { useCreateRoom, useUpdateRoom } from "@/hooks/use-rooms";
import { ApiError } from "@/lib/api-client";
import type { Room } from "@/types";
import { useTranslations } from "next-intl";

export function RoomForm({ room, onSuccess }: { room?: Room; onSuccess: () => void }) {
  const t = useTranslations("rooms");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const roomSchema = createRoomSchema({
    requiredRoomCode: validation("requiredRoomCode"),
    requiredRoomName: validation("requiredRoomName"),
    invalidRentPrice: validation("invalidRentPrice"),
    minimumOccupants: validation("minimumOccupants"),
  });
  const isEdit = !!room;
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const pending = createRoom.isPending || updateRoom.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomFormInput, unknown, RoomInput>({
    resolver: zodResolver(roomSchema),
    defaultValues: room
      ? {
        room_code: room.room_code,
        name: room.name,
        floor: room.floor || "",
        area: room.area ?? undefined,
        rent_price: room.rent_price,
        deposit_required: room.deposit_required,
        max_occupants: room.max_occupants,
        status: room.status,
        note: room.note || "",
      }
      : {
        room_code: "",
        name: "",
        floor: "",
        rent_price: 0,
        deposit_required: 0,
        max_occupants: 1,
        status: "available",
        note: "",
      },
  });

  const onSubmit = (data: RoomInput) => {
    const onSettled = {
      onSuccess: () => {
        toast.success(isEdit ? t("form.updated") : t("form.created"));
        onSuccess();
      },
      onError: (err: unknown) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    };
    if (isEdit) {
      updateRoom.mutate({ id: room!.id, input: data }, onSettled);
    } else {
      createRoom.mutate(data, onSettled);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="room_code">{t("form.roomCode")}</Label>
          <Input id="room_code" {...register("room_code")} />
          {errors.room_code && <p className="text-xs text-destructive">{errors.room_code.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="floor">{t("form.floor")}</Label>
          <Input id="floor" {...register("floor")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="area">{t("form.area")}</Label>
          <Input id="area" type="number" step="0.1" {...register("area")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max_occupants">{t("form.maxOccupants")}</Label>
          <Input id="max_occupants" type="number" {...register("max_occupants")} />
          {errors.max_occupants && <p className="text-xs text-destructive">{errors.max_occupants.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="rent_price">{t("form.rentPrice")}</Label>
          <Input id="rent_price" type="number" step="1000" {...register("rent_price")} />
          {errors.rent_price && <p className="text-xs text-destructive">{errors.rent_price.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deposit_required">{t("form.depositRequired")}</Label>
          <Input id="deposit_required" type="number" step="1000" {...register("deposit_required")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">{t("form.status")}</Label>
        <Select id="status" options={[
          { value: "available", label: t("status.available") },
          { value: "occupied", label: t("status.occupied") },
          { value: "maintenance", label: t("status.maintenance") },
        ]} {...register("status")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">{t("form.note")}</Label>
        <Textarea id="note" rows={2} {...register("note")} />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? t("form.save") : t("form.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}
