"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createGenerateBillSchema, type GenerateBillInput } from "@/schemas/bill";
import { useGenerateBills } from "@/hooks/use-bills";
import { useRooms } from "@/hooks/use-rooms";
import { ApiError } from "@/lib/api-client";
import { currentMonth } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function GenerateBillDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("billing");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const { data: rooms } = useRooms({ status: "occupied" });
  const generateBills = useGenerateBills();

  const { register, handleSubmit, reset } = useForm<GenerateBillInput>({
    resolver: zodResolver(createGenerateBillSchema({ requiredMonth: validation("requiredMonth") })),
    defaultValues: { month: currentMonth(), room_id: "" },
  });

  const roomOptions = (rooms || []).map((r) => ({ value: r.id, label: `${r.room_code} - ${r.name}` }));

  const onSubmit = (data: GenerateBillInput) => {
    generateBills.mutate(data, {
      onSuccess: (bills) => {
        toast.success(t("generate.created", { count: bills.length, month: data.month }));
        reset();
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="month">{t("generate.month")}</Label>
            <Input id="month" type="month" {...register("month")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room_id">{t("generate.room")}</Label>
            <Select
              id="room_id"
              placeholder={t("generate.allOccupiedRooms")}
              options={roomOptions}
              {...register("room_id")}
            />
            <p className="text-xs text-muted-foreground">
              {t("generate.help")}
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={generateBills.isPending}>
              {generateBills.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
