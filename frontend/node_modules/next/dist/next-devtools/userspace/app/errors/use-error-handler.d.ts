import type { RuntimeErrorMetadata } from '../../../../server/dev/hot-reloader-types';
type ErrorHandler = (error: Error) => void;
export declare function handleConsoleError(originError: unknown, consoleErrorArgs: any[]): void;
export declare function handleClientError(error: Error, metadata?: RuntimeErrorMetadata | undefined): void;
export declare function useErrorHandler(handleOnUnhandledError: ErrorHandler, handleOnUnhandledRejection: ErrorHandler): void;
export declare function handleGlobalErrors(): void;
export {};
