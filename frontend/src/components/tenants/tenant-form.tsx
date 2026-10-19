"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { createTenantSchema, type TenantFormInput, type TenantInput } from "@/schemas/tenant";
import { useCreateTenant, useTenants, useUpdateTenant } from "@/hooks/use-tenants";
import { useRooms } from "@/hooks/use-rooms";
import { ApiError } from "@/lib/api-client";
import type { Tenant } from "@/types";
import { useTranslations } from "next-intl";

export function TenantForm({ tenant, onSuccess }: { tenant?: Tenant; onSuccess: () => void }) {
  const t = useTranslations("tenants");
  const roomT = useTranslations("rooms.status");
  const roomFormT = useTranslations("rooms.form");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const tenantSchema = createTenantSchema({
    requiredFullName: validation("requiredFullName"),
    requiredPhone: validation("requiredPhone"),
    invalidEmail: validation("invalidEmail"),
    requiredNationalId: validation("requiredNationalId"),
    requiredLeaseStart: validation("requiredLeaseStart"),
  });
  const isEdit = !!tenant;
  const { data: rooms } = useRooms();
  const { data: activeTenants, isLoading: areTenantsLoading } = useTenants({ status: "active" });
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const pending = createTenant.isPending || updateTenant.isPending;

  const activeTenantCounts = new Map<string, number>();
  for (const activeTenant of activeTenants ?? []) {
    if (activeTenant.room_id) {
      activeTenantCounts.set(activeTenant.room_id, (activeTenantCounts.get(activeTenant.room_id) ?? 0) + 1);
    }
  }
  const roomOptions = (rooms || []).map((room) => {
    const occupantCount = activeTenantCounts.get(room.id) ?? 0;
    return {
      value: room.id,
      label: `${room.room_code} - ${room.name} (${roomT(room.status)}) · ${roomFormT("occupantCount", { count: occupantCount, max: room.max_occupants })}`,
      disabled: occupantCount >= room.max_occupants,
    };
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormInput, unknown, TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant
      ? {
        full_name: tenant.full_name,
        phone: tenant.phone,
        email: tenant.email || "",
        national_id: tenant.national_id,
        address: tenant.address || "",
        room_id: tenant.room_id || "",
        lease_start_date: tenant.lease_start_date,
        lease_end_date: tenant.lease_end_date || "",
        deposit_amount: tenant.deposit_amount,
      }
      : {
        full_name: "",
        phone: "",
        email: "",
        national_id: "",
        address: "",
        room_id: "",
        lease_start_date: new Date().toISOString().slice(0, 10),
        lease_end_date: "",
        deposit_amount: 0,
      },
  });

  const onSubmit = (data: TenantInput) => {
    const onSettled = {
      onSuccess: () => {
        toast.success(isEdit ? t("form.updated") : t("form.created"));
        onSuccess();
      },
      onError: (err: unknown) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    };
    if (isEdit) {
      updateTenant.mutate({ id: tenant!.id, input: data }, onSettled);
    } else {
      createTenant.mutate(data, onSettled);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">{t("form.fullName")}</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t("form.phone")}</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="national_id">{t("form.nationalId")}</Label>
          <Input id="national_id" {...register("national_id")} />
          {errors.national_id && <p className="text-xs text-destructive">{errors.national_id.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">{t("form.address")}</Label>
        <Input id="address" {...register("address")} />
      </div>

      {!isEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="room_id">{t("form.room")}</Label>
          <Select id="room_id" placeholder={common("notAssigned")} options={roomOptions} {...register("room_id")} disabled={areTenantsLoading} />
          <p className="text-xs text-muted-foreground">{t("form.roomHelp")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lease_start_date">{t("form.leaseStart")}</Label>
          <Input id="lease_start_date" type="date" {...register("lease_start_date")} />
          {errors.lease_start_date && <p className="text-xs text-destructive">{errors.lease_start_date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lease_end_date">{t("form.leaseEnd")}</Label>
          <Input id="lease_end_date" type="date" {...register("lease_end_date")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deposit_amount">{t("form.deposit")}</Label>
        <Input id="deposit_amount" type="number" step="1000" {...register("deposit_amount")} />
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
