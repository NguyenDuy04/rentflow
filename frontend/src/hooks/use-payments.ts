"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BankAccountSettings,
  Payment,
  VietQrBank,
  VietQrDetails,
} from "@/types";
import type { BankAccountInput, PaymentInput } from "@/schemas/payment";

export function usePayments(billId?: string) {
  const qs = billId ? `?bill_id=${billId}` : "";
  return useQuery({
    queryKey: ["payments", billId],
    queryFn: () => api.get<Payment[]>(`/payments${qs}`),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) =>
      api.post<Payment>("/payments", {
        ...input,
        transaction_code: input.transaction_code || null,
        payment_date: input.payment_date
          ? new Date(input.payment_date).toISOString()
          : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBankAccountSettings() {
  return useQuery({
    queryKey: ["bank-account-settings"],
    queryFn: () => api.get<BankAccountSettings>("/payments/bank-account"),
  });
}

export function useVietQrBanks() {
  return useQuery({
    queryKey: ["vietqr-banks"],
    queryFn: async () => {
      const response = await fetch("https://api.vietqr.io/v2/banks");
      if (!response.ok) throw new Error("Unable to load supported banks");
      const result = (await response.json()) as { data: VietQrBank[] };
      return result.data
        .filter((bank) => bank.transferSupported === 1 && bank.isTransfer === 1)
        .sort((left, right) =>
          left.shortName.localeCompare(right.shortName, "vi"),
        );
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useUpdateBankAccountSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BankAccountInput) =>
      api.put<BankAccountSettings>("/payments/bank-account", input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bank-account-settings"] }),
  });
}

export function useVietQr(billId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["vietqr", billId],
    queryFn: () => api.get<VietQrDetails>(`/bills/${billId}/vietqr`),
    enabled,
  });
}
