import type { AppPageModule } from './route-modules/app-page/module';
export type ClientComponentLoaderMetrics = {
    clientComponentLoadStart: number;
    clientComponentLoadEnd: number;
    clientComponentLoadTimes: number;
    clientComponentLoadCount: number;
};
/** Metrics owned by one render, including chunks that settle after rendering. */
export declare class ClientComponentLoadTracker {
    private readonly report;
    private clientComponentLoadStart;
    private clientComponentLoadEnd;
    private clientComponentLoadTimes;
    private clientComponentLoadCount;
    private hasLoads;
    private pending;
    private sealed;
    private resolveCompletion;
    constructor(report?: (metrics: ClientComponentLoaderMetrics | undefined) => void);
    isSealed(): boolean;
    beginRequire(startTime: number): void;
    finishRequire(startTime: number, endTime: number): void;
    beginChunk(startTime: number): void;
    finishChunk(startTime: number, endTime: number): void;
    snapshot(): ClientComponentLoaderMetrics | undefined;
    /** Stop accepting new loads and report after any in-flight loads settle. */
    finish(): void;
    private recordStart;
    private recordSettlement;
}
export declare function wrapClientComponentLoader(ComponentMod: AppPageModule): AppPageModule['__next_app__'];
export declare function getClientComponentLoaderMetrics(options?: {
    reset?: boolean;
}): ClientComponentLoaderMetrics | undefined;
