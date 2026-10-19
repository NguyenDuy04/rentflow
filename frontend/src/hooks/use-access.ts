"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  AuditLogEntry,
  MaintenanceIssue,
  TenantPortalOverview,
  User,
} from "@/types";

export function useStaffUsers() {
  return useQuery({
    queryKey: ["staff-users"],
    queryFn: () => api.get<User[]>("/users/staff"),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      email: string;
      full_name: string;
      phone: string;
      password: string;
    }) => api.post<User>("/users/staff", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/users/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export function useCreateTenantAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { tenant_id: string; password: string }) =>
      api.post<User>("/users/tenant-accounts", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export function useAuditLogs(
  params?: {
    actor_role?: string;
    action?: string;
  },
  offset = 0,
) {
  const query = new URLSearchParams();
  if (params?.actor_role) query.set("actor_role", params.actor_role);
  if (params?.action) query.set("action", params.action);
  query.set("limit", "100");
  query.set("offset", String(offset));
  const suffix = query.toString();
  return useQuery({
    queryKey: ["audit-logs", params, offset],
    queryFn: () =>
      api.get<{
        items: AuditLogEntry[];
        total: number;
        limit: number;
        offset: number;
      }>(`/audit-logs?${suffix}`),
  });
}

export function useIssues() {
  return useQuery({
    queryKey: ["issues"],
    queryFn: () => api.get<MaintenanceIssue[]>("/issues"),
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      description: string;
      category: MaintenanceIssue["category"];
    }) => api.post<MaintenanceIssue>("/issues", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-portal"] });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      staff_note,
    }: {
      id: string;
      status: MaintenanceIssue["status"];
      staff_note?: string;
    }) => api.patch<MaintenanceIssue>(`/issues/${id}`, { status, staff_note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-portal"] });
    },
  });
}

export function useTenantPortal() {
  return useQuery({
    queryKey: ["tenant-portal"],
    queryFn: () => api.get<TenantPortalOverview>("/portal/overview"),
  });
}
