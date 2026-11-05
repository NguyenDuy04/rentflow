export declare function reportCurrentRuntimeErrorState(): void;
export declare function createRuntimeErrorStateReporter(sendMessage: (message: string) => void): {
    reportCurrent(): void;
};
