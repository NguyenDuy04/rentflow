import type { IncomingHttpHeaders } from 'http';
/**
 * Returns the script nonce from the request's `Content-Security-Policy`
 * header, falling back to `Content-Security-Policy-Report-Only`.
 */
export declare function getScriptNonceFromHeaders(headers: IncomingHttpHeaders): string | undefined;
export declare function getScriptNonceFromHeader(cspHeaderValue: string): string | undefined;
