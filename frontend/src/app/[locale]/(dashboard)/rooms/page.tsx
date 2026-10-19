"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRooms } from "@/hooks/use-rooms";
import { useMe } from "@/hooks/use-auth";
import { RoomTable } from "@/components/rooms/room-table";
import { RoomForm } from "@/components/rooms/room-form";
import { useTranslations } from "next-intl";

export default function RoomsPage() {
  const t = useTranslations("rooms");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data: user } = useMe();
  const { data: rooms, isLoading } = useRooms({ search: search || undefined, status: status || undefined });
  const statusFilterOptions = [
    { value: "available", label: t("status.available") },
    { value: "occupied", label: t("status.occupied") },
    { value: "maintenance", label: t("status.maintenance") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {user?.role === "owner" && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> {t("addRoom")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row h-11">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-48 h-full cursor-pointer"
          placeholder={t("allStatuses")}
          options={statusFilterOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>

      <Card>
        <RoomTable rooms={rooms} isLoading={isLoading} />
      </Card>

      <Dialog open={createOpen && user?.role === "owner"} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addRoomTitle")}</DialogTitle>
          </DialogHeader>
          <RoomForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
