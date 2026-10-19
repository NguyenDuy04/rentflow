"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Download, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBill, useDownloadBillPdf } from "@/hooks/use-bills";
import { usePayments } from "@/hooks/use-payments";
import { useRooms } from "@/hooks/use-rooms";
import { useTenants } from "@/hooks/use-tenants";
import { formatCurrency, formatDate, formatDateTime, monthLabel } from "@/lib/utils";
import { PaymentForm } from "@/components/payments/payment-form";
import { VietQrDialog } from "@/components/billing/vietqr-dialog";
import { useLocale, useTranslations } from "next-intl";

export default function BillDetailPage() {
  const t = useTranslations("billing");
  const methodT = useTranslations("payments.method");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [vietQrOpen, setVietQrOpen] = useState(false);

  const { data: bill, isLoading } = useBill(params.id);
  const { data: payments } = usePayments(params.id);
  const { data: rooms } = useRooms();
  const { data: tenants } = useTenants();
  const downloadPdf = useDownloadBillPdf();

  const room = rooms?.find((r) => r.id === bill?.room_id);
  const tenant = tenants?.find((t) => t.id === bill?.tenant_id);

  const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);

  if (isLoading || !bill) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const lineItems = [
    { label: t("detail.roomRent"), amount: bill.room_rent },
    { label: t("detail.electricity", { value: bill.electricity_consumption }), amount: bill.electricity_amount },
    { label: t("detail.water", { value: bill.water_consumption }), amount: bill.water_amount },
    { label: t("detail.internet"), amount: bill.internet_fee },
    { label: t("detail.parking"), amount: bill.parking_fee },
    { label: t("detail.cleaning"), amount: bill.cleaning_fee },
    { label: t("detail.other"), amount: bill.other_fee },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/billing")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{bill.bill_code}</h1>
          <p className="text-sm text-muted-foreground">{monthLabel(bill.month, locale)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {bill.status === "paid" ? (
            <Badge variant="success">{t("status.paid")}</Badge>
          ) : bill.is_overdue ? (
            <Badge variant="destructive">{t("status.overdue")}</Badge>
          ) : (
            <Badge variant="warning">{t("status.unpaid")}</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.information")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 xs:grid-cols-2 text-sm">
          <div>
            <p className="text-muted-foreground">{t("detail.room")}</p>
            <p className="font-medium">{room ? `${room.room_code} - ${room.name}` : "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("detail.tenant")}</p>
            <p className="font-medium">{tenant?.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("detail.createdAt")}</p>
            <p className="font-medium">{formatDate(bill.created_at, locale)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("detail.dueDate")}</p>
            <p className="font-medium">{formatDate(bill.due_date, locale)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.costDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lineItems.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span>{formatCurrency(item.amount, locale)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span>{t("detail.total")}</span>
            <span>{formatCurrency(bill.total_amount, locale)}</span>
          </div>
          {totalPaid > 0 && totalPaid < bill.total_amount && (
            <div className="flex justify-between text-sm text-accent-foreground">
              <span>{t("detail.partiallyPaid")}</span>
              <span>{formatCurrency(totalPaid, locale)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.paymentHistory")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!payments || payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("detail.noPayments")}</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{formatCurrency(p.amount, locale)}</p>
                  <p className="text-xs text-muted-foreground">
                    {methodT(p.method === "bank_transfer" ? "bankTransfer" : "cash")} · {formatDateTime(p.payment_date, locale)}
                    {p.transaction_code ? ` · ${p.transaction_code}` : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {bill.status === "unpaid" && (
          <>
            <Button variant="outline" onClick={() => setVietQrOpen(true)}>
              <QrCode className="h-4 w-4" />
              {t("vietqr.generate")}
            </Button>
            <Button onClick={() => setPaymentOpen(true)}>{t("detail.recordPayment")}</Button>
          </>
        )}
        <Button
          variant="outline"
          disabled={downloadPdf.isPending}
          onClick={() =>
            downloadPdf.mutate(
              { id: bill.id, code: bill.bill_code },
              { onError: () => toast.error(t("detail.pdfFailed")) }
            )
          }
        >
          {downloadPdf.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {t("detail.exportPdf")}
        </Button>
      </div>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("detail.recordPayment")}</DialogTitle>
          </DialogHeader>
          <PaymentForm
            billId={bill.id}
            suggestedAmount={bill.total_amount - totalPaid}
            onSuccess={() => setPaymentOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <VietQrDialog open={vietQrOpen} onOpenChange={setVietQrOpen} billId={bill.id} />
    </div>
  );
}
