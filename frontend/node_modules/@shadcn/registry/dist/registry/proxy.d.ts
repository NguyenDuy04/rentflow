import { Dispatcher } from 'undici';

declare function createProxyDispatcher(env?: NodeJS.ProcessEnv): Dispatcher | undefined;
declare function fetchWithProxy(url: string | URL, init?: RequestInit): Promise<Response>;

export { createProxyDispatcher, fetchWithProxy };
