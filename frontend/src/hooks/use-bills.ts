"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, downloadBillPdf } from "@/lib/api-client";
import type { Bill, BillStatus } from "@/types";
import type { GenerateBillInput } from "@/schemas/bill";

export function useBills(params?: {
  month?: string;
  status?: string;
  room_id?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.month) qs.set("month", params.month);
  if (params?.status) qs.set("status", params.status);
  if (params?.room_id) qs.set("room_id", params.room_id);
  const query = qs.toString();
  return useQuery({
    queryKey: ["bills", params],
    queryFn: () => api.get<Bill[]>(`/bills${query ? `?${query}` : ""}`),
  });
}

export function useBill(id: string | undefined) {
  return useQuery({
    queryKey: ["bills", id],
    queryFn: () => api.get<Bill>(`/bills/${id}`),
    enabled: !!id,
  });
}

export function useGenerateBills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateBillInput) =>
      api.post<Bill[]>("/bills/generate", {
        month: input.month,
        room_id: input.room_id || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBillStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BillStatus }) =>
      api.put<Bill>(`/bills/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDownloadBillPdf() {
  return useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      downloadBillPdf(id, code),
  });
}
