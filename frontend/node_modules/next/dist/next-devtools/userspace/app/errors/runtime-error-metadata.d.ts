import type { RuntimeErrorMetadata } from '../../../../server/dev/hot-reloader-types';
export declare function setRuntimeErrorMetadata(error: Error, metadata: RuntimeErrorMetadata): void;
export declare function takeRuntimeErrorMetadata(error: Error): RuntimeErrorMetadata | undefined;
