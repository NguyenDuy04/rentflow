import type { ServerResponse } from 'node:http';
import type { Readable } from 'node:stream';
import type { ClientComponentLoadTracker } from './client-component-renderer-logger';
export declare function isAbortError(e: any): e is Error & {
    name: 'AbortError';
};
export declare function pipeToNodeResponse(readable: ReadableStream<Uint8Array>, res: ServerResponse, waitUntilForEnd?: Promise<unknown>, clientComponentLoadTracker?: ClientComponentLoadTracker): Promise<void>;
export declare function pipeNodeReadableToNodeResponse(readable: Readable, res: ServerResponse, waitUntilForEnd?: Promise<unknown>, clientComponentLoadTracker?: ClientComponentLoadTracker): Promise<void>;
