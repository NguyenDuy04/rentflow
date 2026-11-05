import { addConsumeAwareSignal, addToEnd, fetchSignal } from "./utils.js";
// src/streamedQuery.ts
/**
* This is a helper function to create a query function that streams data from an AsyncIterable.
* Data will be an Array of all the chunks received.
* The query will be in a 'pending' state until the first chunk of data is received, but will go to 'success' after that.
* The query will stay in fetchStatus 'fetching' until the stream ends.
* Explicit cancellation stops further cache updates, even if `streamFn` does not read `signal`.
* If `streamFn` does not read `signal`, the stream continues after the last observer unsubscribes.
* @param options - The `streamFn` that returns an AsyncIterable to stream data from, and the optional
* `refetchMode`, `reducer`, and `initialValue` options.
* @returns A query function to pass as `queryFn`.
* @example
* ```ts
* await queryClient.query({
*   queryKey: ['data'],
*   queryFn: streamedQuery({
*     streamFn: fetchDataInChunks,
*   }),
* })
* ```
*/
function streamedQuery({ streamFn, refetchMode = "reset", reducer = (items, chunk) => addToEnd(items, chunk), initialValue = [] }) {
	return async (context) => {
		const signal = context[fetchSignal];
		if (signal?.aborted) return initialValue;
		const query = context.client.getQueryCache().find({
			queryKey: context.queryKey,
			exact: true
		});
		const isRefetch = !!query && query.isFetched();
		if (isRefetch && refetchMode === "reset") query.setState({
			...query.resetState,
			fetchStatus: "fetching"
		});
		let result = initialValue;
		let cancelled = false;
		const streamFnContext = addConsumeAwareSignal({
			client: context.client,
			meta: context.meta,
			queryKey: context.queryKey,
			pageParam: context.pageParam,
			direction: context.direction
		}, () => context.signal, () => cancelled = true, signal);
		const isStreamInactive = () => cancelled || signal?.aborted === true;
		const stream = await streamFn(streamFnContext);
		const isReplaceRefetch = isRefetch && refetchMode === "replace";
		for await (const chunk of stream) {
			if (isStreamInactive()) break;
			if (isReplaceRefetch) result = reducer(result, chunk);
			else context.client.setQueryData(context.queryKey, (prev) => reducer(prev === void 0 ? initialValue : prev, chunk));
		}
		if (isReplaceRefetch && !isStreamInactive()) context.client.setQueryData(context.queryKey, result);
		const data = context.client.getQueryData(context.queryKey);
		return data === void 0 ? initialValue : data;
	};
}
export { streamedQuery };

//# sourceMappingURL=streamedQuery.js.map