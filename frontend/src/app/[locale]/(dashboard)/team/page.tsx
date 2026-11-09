"use client";

import { useState } from "react";
import { Trash2, UserRoundCog } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateStaff, useDeleteStaff, useStaffUsers } from "@/hooks/use-access";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useLocale, useTranslations } from "next-intl";

type StaffForm = { full_name: string; email: string; phone: string; password: string };
const emptyForm: StaffForm = { full_name: "", email: "", phone: "", password: "" };

export default function TeamPage() {
    const t = useTranslations("team");
    const common = useTranslations("common");
    const locale = useLocale();
    const { data: staff, isLoading } = useStaffUsers();
    const createStaff = useCreateStaff();
    const deleteStaff = useDeleteStaff();
    const [form, setForm] = useState(emptyForm);
    const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createStaff.mutate(form, {
            onSuccess: () => {
                toast.success(t("created"));
                setForm(emptyForm);
            },
            onError: (error) => toast.error(error instanceof ApiError ? error.message : common("genericError")),
        });
    };

    const confirmDelete = () => {
        if (!deleting) return;
        deleteStaff.mutate(deleting.id, {
            onSuccess: () => {
                toast.success(t("deleted"));
                setDeleting(null);
            },
            onError: (error) => toast.error(error instanceof ApiError ? error.message : common("genericError")),
        });
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </header>

            <Card>
                <CardHeader><CardTitle>{t("createTitle")}</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="staff_name">{t("name")}</Label>
                            <Input id="staff_name" required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="staff_email">{t("email")}</Label>
                            <Input id="staff_email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="staff_phone">{t("phone")}</Label>
                            <Input id="staff_phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="staff_password">{t("password")}</Label>
                            <Input id="staff_password" type="password" minLength={8} required autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                        </div>
                        <div className="sm:col-span-2 xl:col-span-4">
                            <Button type="submit" disabled={createStaff.isPending}>
                                <UserRoundCog className="h-4 w-4" />
                                {t("create")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-2 p-4">{[...Array(3)].map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>
                    ) : !staff?.length ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">{t("empty")}</div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>{t("name")}</TableHead>
                                <TableHead>{t("email")}</TableHead>
                                <TableHead>{t("phone")}</TableHead>
                                <TableHead>{t("createdAt")}</TableHead>
                                <TableHead className="w-12" />
                            </TableRow></TableHeader>
                            <TableBody>
                                {staff.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.full_name}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>{member.phone || "—"}</TableCell>
                                        <TableCell>{formatDateTime(member.created_at, locale)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" title={t("delete")} onClick={() => setDeleting({ id: member.id, name: member.full_name })}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{t("deleteTitle", { name: deleting?.name ?? "" })}</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleting(null)}>{common("cancel")}</Button>
                        <Button variant="destructive" disabled={deleteStaff.isPending} onClick={confirmDelete}>{t("delete")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}