"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { MeterReading } from "@/types";
import type { MeterInput } from "@/schemas/meter";

export function useMeters(params?: { room_id?: string; month?: string }) {
  const qs = new URLSearchParams();
  if (params?.room_id) qs.set("room_id", params.room_id);
  if (params?.month) qs.set("month", params.month);
  const query = qs.toString();
  return useQuery({
    queryKey: ["meters", params],
    queryFn: () =>
      api.get<MeterReading[]>(`/meters${query ? `?${query}` : ""}`),
  });
}

export function useCreateMeter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MeterInput) => api.post<MeterReading>("/meters", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meters"] }),
  });
}

export function useUpdateMeter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MeterInput> }) =>
      api.put<MeterReading>(`/meters/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meters"] }),
  });
}
