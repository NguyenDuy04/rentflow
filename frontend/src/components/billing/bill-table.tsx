"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Download, Receipt, CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDownloadBillPdf, useUpdateBillStatus } from "@/hooks/use-bills";
import { useMe } from "@/hooks/use-auth";
import { VietQrDialog } from "@/components/billing/vietqr-dialog";
import { formatCurrency, formatDate, monthLabel } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { Bill, Room } from "@/types";
import { useLocale, useTranslations } from "next-intl";

export function BillTable({
  bills,
  isLoading,
  roomMap,
}: {
  bills: Bill[] | undefined;
  isLoading: boolean;
  roomMap: Map<string, Room>;
}) {
  const t = useTranslations("billing");
  const common = useTranslations("common");
  const locale = useLocale();
  const downloadPdf = useDownloadBillPdf();
  const updateStatus = useUpdateBillStatus();
  const { data: user } = useMe();
  const [vietQrBillId, setVietQrBillId] = useState<string | null>(null);

  const markPaid = (bill: Bill) => {
    updateStatus.mutate(
      { id: bill.id, status: "paid" },
      {
        onSuccess: () => toast.success(t("table.markedPaid", { billCode: bill.bill_code })),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
      }
    );
  };

  const handleDownload = (bill: Bill) => {
    downloadPdf.mutate(
      { id: bill.id, code: bill.bill_code },
      { onError: () => toast.error(t("detail.pdfFailed")) }
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

  if (!bills || bills.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
        <Receipt className="h-8 w-8" />
        <p>{t("table.empty")}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("table.code")}</TableHead>
          <TableHead>{t("table.room")}</TableHead>
          <TableHead>{t("table.month")}</TableHead>
          <TableHead>{t("table.total")}</TableHead>
          <TableHead>{t("table.dueDate")}</TableHead>
          <TableHead>{t("table.status")}</TableHead>
          <TableHead className="w-48"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((bill) => {
          const room = roomMap.get(bill.room_id);
          return (
            <TableRow key={bill.id}>
              <TableCell className="font-medium">
                <Link href={`/billing/${bill.id}`} className="hover:underline">
                  {bill.bill_code}
                </Link>
              </TableCell>
              <TableCell>{room ? `${room.room_code} - ${room.name}` : "—"}</TableCell>
              <TableCell>{monthLabel(bill.month, locale)}</TableCell>
              <TableCell>{formatCurrency(bill.total_amount, locale)}</TableCell>
              <TableCell>{formatDate(bill.due_date, locale)}</TableCell>
              <TableCell>
                {bill.status === "paid" ? (
                  <Badge variant="success">{t("status.paid")}</Badge>
                ) : bill.is_overdue ? (
                  <Badge variant="destructive">{t("status.overdue")}</Badge>
                ) : (
                  <Badge variant="warning">{t("status.unpaid")}</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {bill.status === "unpaid" && (
                    <>
                      <Button variant="ghost" size="sm" title={t("vietqr.generate")} onClick={() => setVietQrBillId(bill.id)}>
                        <QrCode className="h-4 w-4" />
                        {t("vietqr.generate")}
                      </Button>
                      {user?.role === "owner" && (
                        <Button variant="ghost" size="icon" title={t("table.markPaid")} onClick={() => markPaid(bill)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="ghost" size="icon" title={t("table.downloadPdf")} onClick={() => handleDownload(bill)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <VietQrDialog
        open={vietQrBillId !== null}
        onOpenChange={(open) => {
          if (!open) setVietQrBillId(null);
        }}
        billId={vietQrBillId ?? ""}
      />
    </Table>
  );
}
