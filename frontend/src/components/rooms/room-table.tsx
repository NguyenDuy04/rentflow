"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, DoorOpen } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteRoom, useUpdateRoomStatus } from "@/hooks/use-rooms";
import { useMe } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { Room } from "@/types";
import { RoomForm } from "@/components/rooms/room-form";
import { useLocale, useTranslations } from "next-intl";

export function RoomTable({ rooms, isLoading }: { rooms: Room[] | undefined; isLoading: boolean }) {
  const t = useTranslations("rooms");
  const common = useTranslations("common");
  const locale = useLocale();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const deleteRoom = useDeleteRoom();
  const updateRoomStatus = useUpdateRoomStatus();
  const { data: user } = useMe();
  const statuses: Room["status"][] = ["available", "occupied", "maintenance"];

  const confirmDelete = () => {
    if (!deletingRoom) return;
    deleteRoom.mutate(deletingRoom.id, {
      onSuccess: () => {
        toast.success(t("table.deleted"));
        setDeletingRoom(null);
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("table.deleteFailed")),
    });
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

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
        <DoorOpen className="h-8 w-8" />
        <p>{t("table.empty")}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.roomCode")}</TableHead>
            <TableHead>{t("table.name")}</TableHead>
            <TableHead>{t("table.floor")}</TableHead>
            <TableHead>{t("table.area")}</TableHead>
            <TableHead>{t("table.rentPrice")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{room.room_code}</TableCell>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.floor || "—"}</TableCell>
              <TableCell>{room.area ? `${room.area} m²` : "—"}</TableCell>
              <TableCell>{formatCurrency(room.rent_price, locale)}</TableCell>
              <TableCell>
                <Badge variant={room.status === "occupied" ? "success" : room.status === "maintenance" ? "warning" : "secondary"}>
                  {t(`status.${room.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.role === "owner" && (
                      <>
                        <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                          <Pencil className="h-4 w-4" /> {t("table.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => setDeletingRoom(room)}>
                          <Trash2 className="h-4 w-4" /> {t("table.delete")}
                        </DropdownMenuItem>
                      </>
                    )}
                    {(user?.role === "owner" || user?.role === "staff") && (
                      <>
                        {user.role === "owner" && <div className="my-1 border-t" />}
                        {statuses.filter((status) => status !== room.status).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            disabled={updateRoomStatus.isPending}
                            onClick={() => updateRoomStatus.mutate(
                              { id: room.id, status },
                              {
                                onSuccess: () => toast.success(t("table.statusUpdated")),
                                onError: (error) => toast.error(error instanceof ApiError ? error.message : common("genericError")),
                              },
                            )}
                          >
                            {t(`status.${status}`)}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.editTitle")}</DialogTitle>
          </DialogHeader>
          {editingRoom && <RoomForm room={editingRoom} onSuccess={() => setEditingRoom(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingRoom} onOpenChange={(open) => !open && setDeletingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.deleteTitle", { roomCode: deletingRoom?.room_code ?? "" })}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("table.deleteDescription")}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingRoom(null)}>
              {common("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteRoom.isPending}>
              {t("table.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
