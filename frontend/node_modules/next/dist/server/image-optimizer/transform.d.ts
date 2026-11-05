import type { NextConfigComplete } from '../config-shared';
export interface ImageUpstream {
    buffer: Buffer;
    contentType: string | null | undefined;
    cacheControl: string | null | undefined;
    etag: string;
}
export interface ImageOptimizerTransformParams {
    href: string;
    width: number;
    quality: number;
    mimeType: string;
}
export type ImageOptimizerTransformConfig = {
    experimental: Pick<NextConfigComplete['experimental'], 'imgOptConcurrency' | 'imgOptOperationCache' | 'imgOptMaxInputPixels' | 'imgOptSequentialRead' | 'imgOptTimeoutInSeconds' | 'imgOptMozjpeg'>;
    images: Pick<NextConfigComplete['images'], 'dangerouslyAllowSVG' | 'minimumCacheTTL'>;
};
export interface ImageOptimizerTransformLogger {
    error(...args: unknown[]): void;
    warnOnce(message: string): void;
}
export interface ImageOptimizerTransformOptions {
    previousOutput?: {
        buffer: Buffer;
        maxAge?: number;
        etag: string;
        upstreamEtag: string;
    };
    logger?: ImageOptimizerTransformLogger;
    handleDevOutput?: (buffer: Buffer, contentType: string) => Promise<{
        buffer: Buffer;
        contentType: string;
    }>;
}
export interface ImageOptimizerResult {
    buffer: Buffer;
    contentType: string;
    maxAge: number;
    etag: string;
    upstreamEtag: string;
    error?: unknown;
}
export declare function getSharp(concurrency: number | null | undefined, operationCache: boolean | null | undefined): import("sharp").SharpConstructor;
export declare function optimizeImage({ buffer, contentType, quality, width, height, concurrency, operationCache, limitInputPixels, sequentialRead, timeoutInSeconds, mozjpeg, }: {
    buffer: Buffer;
    contentType: string;
    quality: number;
    width: number;
    height?: number;
    concurrency?: number | null;
    operationCache?: boolean | null | undefined;
    limitInputPixels?: number;
    sequentialRead?: boolean | null;
    timeoutInSeconds?: number;
    mozjpeg?: boolean;
}): Promise<Buffer>;
export declare function imageOptimizerTransform(imageUpstream: ImageUpstream, paramsResult: ImageOptimizerTransformParams, nextConfig: ImageOptimizerTransformConfig, opts?: ImageOptimizerTransformOptions): Promise<ImageOptimizerResult>;
