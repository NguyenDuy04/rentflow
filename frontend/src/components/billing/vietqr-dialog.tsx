"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PaymentForm } from "@/components/payments/payment-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useVietQr } from "@/hooks/use-payments";
import { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

export function VietQrDialog({
    open,
    onOpenChange,
    billId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    billId: string;
}) {
    const t = useTranslations("billing.vietqr");
    const locale = useLocale();
    const [confirming, setConfirming] = useState(false);
    const { data, isLoading, error } = useVietQr(billId, open);

    const close = (nextOpen: boolean) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setConfirming(false);
    };

    const copyTransferContent = async () => {
        if (!data) return;
        try {
            await navigator.clipboard.writeText(data.transfer_content);
            toast.success(t("copied"));
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{confirming ? t("confirmTitle") : t("title")}</DialogTitle>
                    <DialogDescription>{confirming ? t("confirmDescription") : t("description")}</DialogDescription>
                </DialogHeader>
                {confirming ? (
                    <>
                        <Button type="button" variant="ghost" className="w-fit" onClick={() => setConfirming(false)}>
                            <ArrowLeft className="h-4 w-4" />
                            {t("backToQr")}
                        </Button>
                        {data && (
                            <PaymentForm
                                billId={billId}
                                suggestedAmount={data.amount}
                                defaultMethod="bank_transfer"
                                onSuccess={() => close(false)}
                            />
                        )}
                    </>
                ) : isLoading ? (
                    <div className="flex min-h-48 items-center justify-center" role="status">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <p className="rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {error instanceof ApiError ? error.message : t("error")}
                    </p>
                ) : data ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">{t("amount")}</p>
                                    <p className="text-xl font-semibold">{formatCurrency(data.amount, locale)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{t("bank")}</p>
                                    <p className="font-medium">{data.bank_name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{t("accountName")}</p>
                                    <p className="font-medium">{data.account_name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{t("accountNumber")}</p>
                                    <p className="font-medium">{data.account_number}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{t("transferContent")}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{data.transfer_content}</p>
                                        <Button type="button" variant="ghost" size="icon" title={t("copy")} onClick={copyTransferContent}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Image
                                src={data.qr_url}
                                alt={t("imageAlt")}
                                width={180}
                                height={180}
                                unoptimized
                                className="mx-auto aspect-square w-full max-w-44 rounded border bg-white object-contain p-2"
                            />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                            <Button asChild variant="outline">
                                <a href={data.qr_url} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    {t("openQr")}
                                </a>
                            </Button>
                            <Button type="button" onClick={() => setConfirming(true)}>
                                <CheckCircle2 className="h-4 w-4" />
                                {t("confirmTransfer")}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}