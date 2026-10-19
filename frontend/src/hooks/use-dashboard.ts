"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  DashboardAlerts,
  DashboardOverview,
  RecentActivity,
  RevenuePoint,
} from "@/types";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => api.get<DashboardOverview>("/dashboard/overview"),
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => api.get<DashboardAlerts>("/dashboard/alerts"),
  });
}

export function useRevenueChart(months: 6 | 12 = 6) {
  return useQuery({
    queryKey: ["dashboard", "revenue-chart", months],
    queryFn: () =>
      api.get<RevenuePoint[]>(`/dashboard/revenue-chart?months=${months}`),
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ["dashboard", "recent-activities"],
    queryFn: () =>
      api.get<RecentActivity[]>("/dashboard/recent-activities?limit=8"),
  });
}
