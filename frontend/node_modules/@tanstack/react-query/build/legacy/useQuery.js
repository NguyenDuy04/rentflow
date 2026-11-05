"use client";
import { useBaseQuery } from "./useBaseQuery.js";
import { QueryObserver } from "@tanstack/query-core";
// src/useQuery.ts
function useQuery(options, queryClient) {
	return useBaseQuery(options, QueryObserver, queryClient);
}
export { useQuery };

//# sourceMappingURL=useQuery.js.map