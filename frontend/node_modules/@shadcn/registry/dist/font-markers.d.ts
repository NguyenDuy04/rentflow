type FontMarkerSource = {
    fonts?: Array<{
        font?: {
            variable?: string;
        };
    }>;
    cssVars?: Record<string, Record<string, unknown> | undefined>;
};
declare function getSupportedFontMarkers(sources: FontMarkerSource[]): string[];

export { getSupportedFontMarkers };
