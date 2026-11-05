declare const logger: {
    error(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    info(...args: unknown[]): void;
    success(...args: unknown[]): void;
    log(...args: unknown[]): void;
    break(): void;
};

export { logger };
