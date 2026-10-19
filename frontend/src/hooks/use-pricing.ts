"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { PricingConfig } from "@/types";
import type { PricingInput } from "@/schemas/pricing";

export function usePricing() {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: () => api.get<PricingConfig>("/pricing"),
  });
}

export function useUpdatePricing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PricingInput) => api.put<PricingConfig>("/pricing", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricing"] }),
  });
}
