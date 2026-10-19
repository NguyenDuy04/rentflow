"use client";

import { useState } from "react";
import { QrCode, Send } from "lucide-react";
import { toast } from "sonner";

import { VietQrDialog } from "@/components/billing/vietqr-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCreateIssue, useTenantPortal } from "@/hooks/use-access";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { IssueCategory } from "@/types";
import { useLocale, useTranslations } from "next-intl";

export default function TenantPortalPage() {
    const t = useTranslations("tenantPortal");
    const common = useTranslations("common");
    const billT = useTranslations("billing.status");
    const paymentT = useTranslations("payments.method");
    const locale = useLocale();
    const { data, isLoading } = useTenantPortal();
    const createIssue = useCreateIssue();
    const [billForQr, setBillForQr] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<IssueCategory>("other");
    const categories: IssueCategory[] = ["plumbing", "electrical", "appliance", "other"];
    const categoryOptions = categories.map((value) => ({ value, label: t(value) }));

    const submitIssue = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createIssue.mutate({ title, description, category }, {
            onSuccess: () => {
                toast.success(t("issueSent"));
                setTitle("");
                setDescription("");
                setCategory("other");
            },
            onError: (error) => toast.error(error instanceof ApiError ? error.message : common("genericError")),
        });
    };

    if (isLoading || !data) {
        return <div className="space-y-4">{[...Array(4)].map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}</div>;
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">{t("welcome", { name: data.tenant.full_name })}</h1>
                <p className="text-sm text-muted-foreground">{t("description")}</p>
            </header>

            <Card>
                <CardHeader><CardTitle>{t("room")}</CardTitle></CardHeader>
                <CardContent>
                    {data.room ? (
                        <div className="grid grid-cols-1 gap-4 text-sm xs:grid-cols-3">
                            <div><p className="text-muted-foreground">{t("roomCode")}</p><p className="font-medium">{data.room.room_code} · {data.room.name}</p></div>
                            <div><p className="text-muted-foreground">{t("lease")}</p><p className="font-medium">{formatDate(data.tenant.lease_start_date, locale)}</p></div>
                            <div><p className="text-muted-foreground">{t("rent")}</p><p className="font-medium">{formatCurrency(data.room.rent_price, locale)}</p></div>
                        </div>
                    ) : <p className="text-sm text-muted-foreground">{t("noRoom")}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{t("bills")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {!data.bills.length ? <p className="text-sm text-muted-foreground">{t("noBills")}</p> : data.bills.map((bill) => (
                        <div key={bill.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                            <div>
                                <p className="font-medium">{t("bill", { code: bill.bill_code })}</p>
                                <p className="text-xs text-muted-foreground">{bill.month} · {t("due", { date: formatDate(bill.due_date, locale) })}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold tabular-nums">{formatCurrency(bill.total_amount, locale)}</span>
                                {bill.status === "unpaid" ? (
                                    <Button size="sm" variant="outline" onClick={() => setBillForQr(bill.id)}>
                                        <QrCode className="h-4 w-4" /> {t("pay")}
                                    </Button>
                                ) : <Badge variant="success">{billT("paid")}</Badge>}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{t("payments")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {!data.payments.length ? <p className="text-sm text-muted-foreground">{t("noPayments")}</p> : data.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                            <div><p className="font-medium">{formatCurrency(payment.amount, locale)}</p><p className="text-xs text-muted-foreground">{formatDateTime(payment.payment_date, locale)}</p></div>
                            <Badge variant="secondary">{paymentT(payment.method === "bank_transfer" ? "bankTransfer" : "cash")}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{t("issues")}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <form onSubmit={submitIssue} className="space-y-3">
                        <div className="space-y-1.5"><Label htmlFor="issue_title">{t("issueTitle")}</Label><Input id="issue_title" required minLength={3} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} /></div>
                        <div className="space-y-1.5"><Label htmlFor="issue_category">{t("issueCategory")}</Label><Select id="issue_category" options={categoryOptions} value={category} onChange={(event) => setCategory(event.target.value as IssueCategory)} /></div>
                        <div className="space-y-1.5"><Label htmlFor="issue_description">{t("issueDescription")}</Label><Textarea id="issue_description" required minLength={5} maxLength={4000} value={description} onChange={(event) => setDescription(event.target.value)} /></div>
                        <Button type="submit" disabled={createIssue.isPending}><Send className="h-4 w-4" />{t("submitIssue")}</Button>
                    </form>
                    <div className="space-y-3">
                        {!data.issues.length ? <p className="text-sm text-muted-foreground">{t("issueEmpty")}</p> : data.issues.map((issue) => (
                            <div key={issue.id} className="border-b border-border pb-3 last:border-0">
                                <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{issue.title}</p><Badge variant={issue.status === "resolved" ? "success" : "secondary"}>{t(issue.status === "in_progress" ? "inProgress" : issue.status)}</Badge></div>
                                <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(issue.created_at, locale)}</p>
                                {issue.staff_note && <p className="mt-2 text-sm">{issue.staff_note}</p>}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <VietQrDialog open={billForQr !== null} onOpenChange={(open) => !open && setBillForQr(null)} billId={billForQr ?? ""} />
        </div>
    );
}