"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIssues, useUpdateIssue } from "@/hooks/use-access";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { IssueCategory, IssueStatus } from "@/types";
import { useLocale, useTranslations } from "next-intl";

export default function IssuesPage() {
    const t = useTranslations("issues");
    const common = useTranslations("common");
    const locale = useLocale();
    const { data: issues, isLoading } = useIssues();
    const updateIssue = useUpdateIssue();
    const categories: IssueCategory[] = ["plumbing", "electrical", "appliance", "other"];
    const statuses: IssueStatus[] = ["open", "in_progress", "resolved"];
    const statusOptions = statuses.map((status) => ({ value: status, label: t(status === "in_progress" ? "inProgress" : status) }));

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </header>
            <div className="overflow-x-auto rounded-md border border-border bg-card">
                {isLoading ? (
                    <div className="space-y-2 p-4">{[...Array(5)].map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>
                ) : !issues?.length ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">{t("empty")}</div>
                ) : (
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>{t("created")}</TableHead>
                            <TableHead>{t("tenant")}</TableHead>
                            <TableHead>{t("room")}</TableHead>
                            <TableHead>{t("issue")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>{issues.map((issue) => (
                            <TableRow key={issue.id}>
                                <TableCell className="whitespace-nowrap text-sm">{formatDateTime(issue.created_at, locale)}</TableCell>
                                <TableCell>{issue.tenant_name}</TableCell>
                                <TableCell>{issue.room_label}</TableCell>
                                <TableCell className="min-w-64">
                                    <p className="font-medium">{issue.title}</p>
                                    <p className="whitespace-normal text-xs text-muted-foreground">{issue.description}</p>
                                </TableCell>
                                <TableCell><Badge variant="secondary">{t(categories.includes(issue.category) ? issue.category : "other")}</Badge></TableCell>
                                <TableCell>
                                    <Select
                                        aria-label={`${t("status")}: ${issue.title}`}
                                        className="min-w-36"
                                        options={statusOptions}
                                        value={issue.status}
                                        disabled={updateIssue.isPending}
                                        onChange={(event) => updateIssue.mutate(
                                            { id: issue.id, status: event.target.value as IssueStatus },
                                            {
                                                onSuccess: () => toast.success(t("updated")),
                                                onError: (error) => toast.error(error instanceof ApiError ? error.message : common("genericError")),
                                            },
                                        )}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}