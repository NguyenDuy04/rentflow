import type { DynamicParamTypesShort } from '../shared/lib/app-router-types';
import type { NormalizedPathname, NormalizedSearch } from './components/segment-cache/cache-key';
import type { RSCResponse } from './components/router-reducer/fetch-server-response';
import type { ParsedUrlQuery } from 'querystring';
export type RouteParamValue = string | Array<string> | null;
export declare function normalizeRenderedSearch(search: string): NormalizedSearch;
export declare function getRenderedSearch(response: RSCResponse<unknown> | Response): NormalizedSearch;
export declare function getRenderedPathname(response: RSCResponse<unknown> | Response): NormalizedPathname;
/**
 * Like getRenderedPathname, but derived from the request URL rather than the
 * response. Used in output: "export" mode, where the response URL has the
 * segment filename appended to the pathname — and where rewrites don't
 * exist, so the request pathname is always the rendered pathname.
 */
export declare function getPathnameFromRequestURL(url: URL): NormalizedPathname;
export declare function canonicalizeURLPart(part: string): string;
export declare function parseDynamicParamFromURLPart(paramType: DynamicParamTypesShort, pathnameParts: Array<string>, partIndex: number): RouteParamValue;
export declare function doesStaticSegmentAppearInURL(segment: string): boolean;
export declare function getCacheKeyForDynamicParam(paramValue: RouteParamValue): string;
export declare function urlToUrlWithoutFlightMarker(url: URL): URL;
export declare function getParamValueFromCacheKey(paramCacheKey: string, paramType: DynamicParamTypesShort): string | string[];
export declare function urlSearchParamsToParsedUrlQuery(searchParams: URLSearchParams): ParsedUrlQuery;
