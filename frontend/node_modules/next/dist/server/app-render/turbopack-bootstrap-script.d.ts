import { type BuildManifest } from '../get-page-files';
/**
 * Renders the Turbopack chunk-group bootstrap (see
 * `getTurbopackChunkGroupBootstrap`) as an inline `<script>` tag.
 *
 * Under Cache Components, a static shell is prerendered without a request, so
 * it can never carry the per-request CSP nonce. A static shell that is resumed
 * therefore leaves the bootstrap out, and the per-request resume emits it with
 * this helper instead, so that a nonce-based CSP allows it. The resume can't
 * add it to the shell, since on Vercel the shell is served before any Next.js
 * code runs. The shared runtime picks up a bootstrap pushed after it has
 * loaded: once it runs it replaces the queue with `{ push: registerChunk }`.
 * The entry's runtime modules can then be instantiated from within this inline
 * script, so they mustn't depend on `document.currentScript` being one of the
 * chunk scripts (see `appBootstrap`).
 */
export declare function getTurbopackBootstrapScriptTag(scriptContent: string, nonce: string | undefined): string;
export declare function createTurbopackBootstrapScriptStream(scriptContent: string, nonce: string | undefined): ReadableStream<Uint8Array>;
/**
 * The Turbopack bootstrap script for `page`, for serving a Cache Components
 * static shell on its own, without the resume that would otherwise emit it.
 * Returns undefined when the build doesn't inline a bootstrap for the page.
 */
export declare function createTurbopackBootstrapScriptStreamForPage(buildManifest: BuildManifest, page: string, nonce: string | undefined): ReadableStream<Uint8Array> | undefined;
