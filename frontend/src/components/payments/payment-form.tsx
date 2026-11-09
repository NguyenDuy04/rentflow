"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { createPaymentSchema, type PaymentFormInput, type PaymentInput } from "@/schemas/payment";
import { useCreatePayment } from "@/hooks/use-payments";
import { ApiError } from "@/lib/api-client";
import { useTranslations } from "next-intl";

export function PaymentForm({
  billId,
  suggestedAmount,
  defaultMethod = "cash",
  onSuccess,
}: {
  billId: string;
  suggestedAmount: number;
  defaultMethod?: "cash" | "bank_transfer";
  onSuccess: () => void;
}) {
  const t = useTranslations("payments.form");
  const methodT = useTranslations("payments.method");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const paymentSchema = createPaymentSchema({ positiveAmount: validation("positiveAmount") });
  const createPayment = useCreatePayment();
  const methodOptions = [
    { value: "cash", label: methodT("cash") },
    { value: "bank_transfer", label: methodT("bankTransfer") },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormInput, unknown, PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      bill_id: billId,
      amount: suggestedAmount,
      method: defaultMethod,
      payment_date: new Date().toISOString().slice(0, 10),
      transaction_code: "",
    },
  });

  const onSubmit = (data: PaymentInput) => {
    createPayment.mutate(data, {
      onSuccess: () => {
        toast.success(t("success"));
        onSuccess();
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : common("genericError")),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("bill_id")} />
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">{t("amount")}</Label>
          <Input id="amount" type="number" step="1000" {...register("amount")} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="method">{t("method")}</Label>
          <Select id="method" options={methodOptions} {...register("method")} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="payment_date">{t("date")}</Label>
          <Input id="payment_date" type="date" {...register("payment_date")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="transaction_code">{t("transactionCode")}</Label>
          <Input id="transaction_code" placeholder={t("optional")} {...register("transaction_code")} />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createPayment.isPending}>
          {createPayment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}
