"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRooms } from "@/hooks/use-rooms";
import { useTenants, useTransferRoom } from "@/hooks/use-tenants";
import { ApiError } from "@/lib/api-client";
import type { Tenant } from "@/types";
import { useTranslations } from "next-intl";

export function TransferRoomDialog({ tenant, onClose }: { tenant: Tenant | null; onClose: () => void }) {
  const t = useTranslations("tenants.transfer");
  const roomT = useTranslations("rooms.form");
  const [newRoomId, setNewRoomId] = useState("");
  const { data: rooms } = useRooms();
  const { data: activeTenants, isLoading: areTenantsLoading } = useTenants({ status: "active" });
  const transferRoom = useTransferRoom();

  const activeTenantCounts = new Map<string, number>();
  for (const activeTenant of activeTenants ?? []) {
    if (activeTenant.room_id) {
      activeTenantCounts.set(activeTenant.room_id, (activeTenantCounts.get(activeTenant.room_id) ?? 0) + 1);
    }
  }
  const roomOptions = (rooms || [])
    .filter((r) => r.id !== tenant?.room_id)
    .map((room) => {
      const occupantCount = activeTenantCounts.get(room.id) ?? 0;
      return {
        value: room.id,
        label: `${room.room_code} - ${room.name} · ${roomT("occupantCount", { count: occupantCount, max: room.max_occupants })}`,
        disabled: occupantCount >= room.max_occupants,
      };
    });
  const selectedRoom = rooms?.find((room) => room.id === newRoomId);
  const selectedRoomIsFull = selectedRoom && (activeTenantCounts.get(selectedRoom.id) ?? 0) >= selectedRoom.max_occupants;

  const handleClose = () => {
    setNewRoomId("");
    onClose();
  };

  const handleTransfer = () => {
    if (!tenant || !newRoomId || selectedRoomIsFull) return;
    transferRoom.mutate(
      { id: tenant.id, newRoomId },
      {
        onSuccess: () => {
          toast.success(t("success", { name: tenant.full_name }));
          handleClose();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("failed")),
      }
    );
  };

  return (
    <Dialog open={!!tenant} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { name: tenant?.full_name ?? "" })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="new_room">{t("newRoom")}</Label>
          <Select
            id="new_room"
            placeholder={t("placeholder")}
            options={roomOptions}
            disabled={areTenantsLoading}
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t("capacityHelp")}</p>
        </div>
        <DialogFooter>
          <Button onClick={handleTransfer} disabled={!newRoomId || areTenantsLoading || selectedRoomIsFull || transferRoom.isPending}>
            {transferRoom.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
