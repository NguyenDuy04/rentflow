"use client";
import { useBaseQuery } from "./useBaseQuery.js";
import { InfiniteQueryObserver } from "@tanstack/query-core";
// src/useInfiniteQuery.ts
function useInfiniteQuery(options, queryClient) {
	return useBaseQuery(options, InfiniteQueryObserver, queryClient);
}
export { useInfiniteQuery };

//# sourceMappingURL=useInfiniteQuery.js.map