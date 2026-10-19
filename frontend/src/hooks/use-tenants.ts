"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Tenant } from "@/types";
import type { TenantInput } from "@/schemas/tenant";

export function useTenants(params?: {
  search?: string;
  status?: string;
  room_id?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  if (params?.room_id) qs.set("room_id", params.room_id);
  const query = qs.toString();
  return useQuery({
    queryKey: ["tenants", params],
    queryFn: () => api.get<Tenant[]>(`/tenants${query ? `?${query}` : ""}`),
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantInput) =>
      api.post<Tenant>("/tenants", cleanTenantInput(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TenantInput }) =>
      api.put<Tenant>(`/tenants/${id}`, cleanTenantInput(input, true)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tenants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useTransferRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newRoomId }: { id: string; newRoomId: string }) =>
      api.post<Tenant>(`/tenants/${id}/transfer-room`, {
        new_room_id: newRoomId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useEndContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Tenant>(`/tenants/${id}/end-contract`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

function cleanTenantInput(input: TenantInput, isUpdate = false) {
  const base = {
    ...input,
    email: input.email || null,
    address: input.address || null,
    lease_end_date: input.lease_end_date || null,
  };
  if (isUpdate) {
    // room_id is changed only via the dedicated transfer-room action
    const { ...rest } = base;
    return rest;
  }
  return { ...base, room_id: input.room_id || null };
}
