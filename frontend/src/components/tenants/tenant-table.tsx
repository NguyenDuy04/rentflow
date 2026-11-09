"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Users, ArrowRightLeft, FileX, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteTenant, useEndContract } from "@/hooks/use-tenants";
import { useCreateTenantAccount } from "@/hooks/use-access";
import { useMe } from "@/hooks/use-auth";
import { useRooms } from "@/hooks/use-rooms";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { Tenant } from "@/types";
import { TenantForm } from "@/components/tenants/tenant-form";
import { TransferRoomDialog } from "@/components/tenants/transfer-room-dialog";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TenantTable({ tenants, isLoading }: { tenants: Tenant[] | undefined; isLoading: boolean }) {
  const t = useTranslations("tenants");
  const common = useTranslations("common");
  const locale = useLocale();
  const { data: rooms } = useRooms();
  const roomMap = new Map((rooms || []).map((r) => [r.id, r]));

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [transferringTenant, setTransferringTenant] = useState<Tenant | null>(null);
  const deleteTenant = useDeleteTenant();
  const endContract = useEndContract();
  const createPortalAccount = useCreateTenantAccount();
  const { data: user } = useMe();
  const [portalTenant, setPortalTenant] = useState<Tenant | null>(null);
  const [portalPassword, setPortalPassword] = useState("");

  const confirmDelete = () => {
    if (!deletingTenant) return;
    deleteTenant.mutate(deletingTenant.id, {
      onSuccess: () => {
        toast.success(t("table.deleted"));
        setDeletingTenant(null);
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("table.deleteFailed")),
    });
  };

  const handleEndContract = (tenant: Tenant) => {
    endContract.mutate(tenant.id, {
      onSuccess: () => toast.success(t("table.endContractSuccess", { name: tenant.full_name })),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : t("table.endContractFailed")),
    });
  };

  const handleCreatePortal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!portalTenant) return;
    createPortalAccount.mutate(
      { tenant_id: portalTenant.id, password: portalPassword },
      {
        onSuccess: () => {
          toast.success(t("table.portalCreated"));
          setPortalTenant(null);
          setPortalPassword("");
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : common("genericError")),
      },
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

  if (!tenants || tenants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
        <Users className="h-8 w-8" />
        <p>{t("table.empty")}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.fullName")}</TableHead>
            <TableHead>{t("table.phone")}</TableHead>
            <TableHead>{t("table.room")}</TableHead>
            <TableHead>{t("table.leaseStart")}</TableHead>
            <TableHead>{t("table.leaseEnd")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => {
            const room = tenant.room_id ? roomMap.get(tenant.room_id) : undefined;
            return (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.full_name}</TableCell>
                <TableCell>{tenant.phone}</TableCell>
                <TableCell>{room ? `${room.room_code} - ${room.name}` : "—"}</TableCell>
                <TableCell>{formatDate(tenant.lease_start_date, locale)}</TableCell>
                <TableCell>{tenant.lease_end_date ? formatDate(tenant.lease_end_date, locale) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={tenant.status === "active" ? "success" : "secondary"}>
                    {tenant.status === "active" ? t("status.active") : t("status.ended")}
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
                          <DropdownMenuItem onClick={() => setEditingTenant(tenant)}>
                            <Pencil className="h-4 w-4" /> {t("table.edit")}
                          </DropdownMenuItem>
                          {tenant.status === "active" && (
                            <>
                              <DropdownMenuItem onClick={() => setTransferringTenant(tenant)}>
                                <ArrowRightLeft className="h-4 w-4" /> {t("table.transfer")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEndContract(tenant)}>
                                <FileX className="h-4 w-4" /> {t("table.endContract")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </>
                      )}
                      {(user?.role === "owner" || user?.role === "staff") && tenant.email && !tenant.portal_enabled && (
                        <DropdownMenuItem onClick={() => setPortalTenant(tenant)}>
                          <UserRoundPlus className="h-4 w-4" /> {t("table.createPortal")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => setDeletingTenant(tenant)}>
                        <Trash2 className="h-4 w-4" /> {t("table.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.editTitle")}</DialogTitle>
          </DialogHeader>
          {editingTenant && <TenantForm tenant={editingTenant} onSuccess={() => setEditingTenant(null)} />}
        </DialogContent>
      </Dialog>

      <TransferRoomDialog tenant={transferringTenant} onClose={() => setTransferringTenant(null)} />

      <Dialog
        open={!!portalTenant}
        onOpenChange={(open) => {
          if (!open) {
            setPortalTenant(null);
            setPortalPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.portalTitle", { name: portalTenant?.full_name ?? "" })}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePortal} className="space-y-4">
            <p className="text-sm text-muted-foreground">{portalTenant?.email}</p>
            <div className="space-y-1.5">
              <Label htmlFor="portal_password">{t("table.portalPassword")}</Label>
              <Input
                id="portal_password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                value={portalPassword}
                onChange={(event) => setPortalPassword(event.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={createPortalAccount.isPending}>
                {createPortalAccount.isPending && <Users className="h-4 w-4 animate-pulse" />}
                {t("table.createPortal")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingTenant} onOpenChange={(open) => !open && setDeletingTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("table.deleteTitle", { name: deletingTenant?.full_name ?? "" })}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("table.deleteDescription")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingTenant(null)}>
              {common("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteTenant.isPending}>
              {t("table.deletedConfirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
