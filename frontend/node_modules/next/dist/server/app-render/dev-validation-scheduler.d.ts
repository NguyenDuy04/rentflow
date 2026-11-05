export interface DevValidationGeneration {
    readonly signal: AbortSignal;
    finish(): void;
}
export declare class DevValidationScheduler {
    private readonly maxActiveValidations;
    private readonly currentValidationByDocument;
    constructor(maxActiveValidations: number);
    get size(): number;
    begin(htmlRequestId: string): DevValidationGeneration;
}
export declare function beginDevValidation(htmlRequestId: string): DevValidationGeneration;
/**
 * Give incoming requests a chance to enter app rendering and supersede the
 * current validation before another expensive render attempt starts.
 *
 * @returns Whether validation should continue.
 * - `true`: validation should continue
 * - `false` the validation was superseded and should be aborted.
 */
export declare function yieldToForegroundRequest(validationSignal: AbortSignal): Promise<boolean>;
