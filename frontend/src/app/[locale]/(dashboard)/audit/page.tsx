"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuditLogs } from "@/hooks/use-access";
import { formatDateTime } from "@/lib/utils";
import type { UserRole } from "@/types";
import { useLocale, useTranslations } from "next-intl";

export default function AuditPage() {
    const t = useTranslations("audit");
    const locale = useLocale();
    const [actorRole, setActorRole] = useState("");
    const [action, setAction] = useState("");
    const [offset, setOffset] = useState(0);
    const { data, isLoading } = useAuditLogs({ actor_role: actorRole || undefined, action: action || undefined }, offset);
    const roleOptions = (["owner", "staff", "tenant"] as UserRole[]).map((role) => ({
        value: role,
        label: t(role),
    }));

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </header>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
                <Input aria-label={t("searchAction")} placeholder={t("searchAction")} value={action} onChange={(event) => { setAction(event.target.value); setOffset(0); }} />
                <Select aria-label={t("filterRole")} options={roleOptions} placeholder={t("allRoles")} value={actorRole} onChange={(event) => { setActorRole(event.target.value); setOffset(0); }} />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t("showing", { count: data?.items.length ?? 0, total: data?.total ?? 0 })}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 100))}>{t("previous")}</Button>
                    <Button variant="outline" size="sm" disabled={!data || offset + data.items.length >= data.total} onClick={() => setOffset(offset + 100)}>{t("next")}</Button>
                </div>
            </div>
            <div className="overflow-x-auto rounded-md border border-border bg-card">
                {isLoading ? (
                    <div className="space-y-2 p-4">{[...Array(5)].map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>
                ) : !data?.items.length ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">{t("empty")}</div>
                ) : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>{t("time")}</TableHead>
                            <TableHead>{t("actor")}</TableHead>
                            <TableHead>{t("role")}</TableHead>
                            <TableHead>{t("action")}</TableHead>
                            <TableHead>{t("ip")}</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>{data.items.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="whitespace-nowrap">{formatDateTime(entry.created_at, locale)}</TableCell>
                                <TableCell><span className="font-medium">{entry.actor_name}</span><span className="block text-xs text-muted-foreground">{entry.actor_email}</span></TableCell>
                                <TableCell>{t(entry.actor_role)}</TableCell>
                                <TableCell className="font-mono text-xs">{entry.action}</TableCell>
                                <TableCell className="font-mono text-xs">{entry.ip_address || "—"}</TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}