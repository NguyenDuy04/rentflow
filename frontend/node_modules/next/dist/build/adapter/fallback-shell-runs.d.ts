/**
 * One entry in the route table that a build passes to an adapter can serve
 * several fallback shells.
 *
 * A fallback shell repeats the whole path of its source page, and it resolves
 * the leading params of that page to concrete values. Those values form the
 * prefix of the shell path, so the shells of one source page differ only in
 * that prefix. A pattern can list several prefixes as alternatives, which lets
 * one entry match them all.
 *
 * The shells that one entry serves are a run: a stretch of neighbours in the
 * manifest. Adjacency is what makes a run safe to serve from one entry. That
 * entry takes the position of the first shell of the run, which this file
 * calls the representative, so every shell that the entry replaces keeps its
 * place relative to the routes around it.
 */
import type { RoutesManifest } from '..';
export type FallbackShellRun = {
    /**
     * The prefix of each shell of the run, in the order that the manifest lists
     * them. The pattern of the entry holds these as alternatives, and the first
     * one belongs to the representative.
     */
    prefixes: readonly string[];
    /**
     * The path that follows the prefix, without a leading slash. Every shell of
     * the run shares it.
     */
    tail: string;
};
export type FallbackShellRuns = {
    /**
     * The runs, keyed by the page of the representative of each.
     */
    byRepresentativePage: Map<string, FallbackShellRun>;
    /**
     * The pages of the shells that a run serves, apart from the representative
     * that keys it. The caller emits no entry of its own for these.
     */
    replacedPages: Set<string>;
};
/**
 * Collects the runs of fallback shells that one entry can serve.
 *
 * The shells of a run are neighbours in the manifest that agree on:
 *
 * - The source page.
 * - The path that follows the prefix.
 * - The value of `fallback: false`.
 *
 * They have to be neighbours because the entry takes the position of the first
 * shell of the run. Every shell that the entry replaces then keeps its place
 * relative to the routes around it. Any other route between two shells ends the
 * run, because an entry that reached across it would move ahead of a route that
 * a request matches first.
 *
 * They have to agree on `fallback: false` because an entry carries one set of
 * conditions.
 *
 * The caller builds one pattern for a run, and it lists the prefixes of the run
 * as complete alternatives. For a source page `/[team]/[locale]/posts/[id]`
 * with shells for `acme/en`, `acme/de` and `globex/en`, that pattern holds:
 *
 * ```
 * (acme/en|acme/de|globex/en)
 * ```
 *
 * A pattern that offered a choice per param instead, such as
 * `(acme|globex)/(en|de)`, would also match `globex/de`. The build never
 * prerendered that pair, so a request for it would resolve to an output that
 * does not exist, and it would then fall through to whichever route claims the
 * rewritten path.
 *
 * A shell can belong to no run, and one source page can hold several runs. That
 * happens when the build resolves a different number of params for neighbouring
 * shells, because their prefixes then have different lengths and the paths that
 * follow them differ.
 *
 * A run of only one shell has a single prefix, so an entry for it would match
 * what the entry for that shell already matches. This function leaves such a
 * shell out of the result.
 */
export declare function collectFallbackShellRuns(dynamicRoutes: RoutesManifest['dynamicRoutes'], hasFallbackFalse: (page: string) => boolean): FallbackShellRuns;
