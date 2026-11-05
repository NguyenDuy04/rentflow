export type CardColor = 'blue' | 'purple' | 'red' | 'amber' | 'teal' | 'gray';
export type FixCardGroup = 'stream' | 'block' | 'cache' | 'static' | 'dynamic' | 'client' | 'defer' | 'measure' | 'ignore' | 'render' | 'mark' | 'upgrade' | 'disable' | 'remove';
export type FixCardIcon = 'align-left' | 'arrow-up' | 'check' | 'database' | 'history' | 'layout' | 'loading' | 'minus' | 'minus-circle' | 'pointer-click' | 'server-stack' | 'timer' | 'zap';
export declare const FIX_CARD_GROUPS: Record<FixCardGroup, {
    label: string;
    color: CardColor;
    icon: FixCardIcon;
}>;
export type FixCard = {
    /** Docs anchor for this card. */
    id: string;
    title: string;
    group: FixCardGroup;
    /** Docs URL, or null for no link. */
    link: string | null;
    snippets: Snippet[];
    /** Show the Copy prompt button on this card. */
    copyable?: boolean;
};
export type SnippetPart = {
    text: string;
    highlight?: boolean;
};
export type Snippet = {
    text: string;
    highlight?: boolean;
    /** Inline highlights within the line; takes precedence over the line-level `highlight` flag. */
    parts?: SnippetPart[];
};
export type GuidanceKind = 'static-route' | 'static-metadata' | 'static-viewport' | 'blocking-route' | 'client-hook' | 'metadata' | 'viewport' | 'sync-io' | 'sync-io-client' | 'unrendered-segment' | 'link-prefetch-partial';
export type GuidanceVariant = 'link' | 'runtime' | 'prefetch' | 'navigation' | 'dynamic';
export declare const DOCS_URLS: Record<GuidanceKind, string>;
export declare const BLOCKING_ROUTE_DOCS_URLS: Record<GuidanceVariant, string>;
export declare const BLOCKING_METADATA_DOCS_URLS: Record<GuidanceVariant, string>;
export declare const BLOCKING_VIEWPORT_DOCS_URLS: Record<GuidanceVariant, string>;
export declare const SYNC_IO_DOCS: Record<string, string>;
export declare const SYNC_IO_CLIENT_DOCS: Record<string, string>;
export declare const EXPLANATIONS: Record<GuidanceKind, string>;
export declare const BLOCKING_ROUTE_IN_NAVIGATION_EXPLANATION = "This prevents the navigation from being instant, leading to a slower user experience.";
export declare const BLOCKING_ROUTE_BLOCKED_SHELL_EXPLANATION = "This may prevent the navigation from being instant, leading to a slower user experience.";
export declare const CACHE_STAGE_METADATA_EXPLANATION = "Metadata can already stream, so delaying it may be unintentional.";
export declare const CACHE_STAGE_VIEWPORT_EXPLANATION = "This prevents Next.js from creating the App Shell, leading to a slower user experience.";
export declare function getCards(kind: GuidanceKind, variant: GuidanceVariant, cause?: string): FixCard[];
export declare function getStaticRouteDocsUrl(kind: GuidanceKind, variant: GuidanceVariant): string;
