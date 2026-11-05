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
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "collectFallbackShellRuns", {
    enumerable: true,
    get: function() {
        return collectFallbackShellRuns;
    }
});
const _routeregex = require("../../shared/lib/router/utils/route-regex");
const _escaperegexp = require("../../shared/lib/escape-regexp");
/**
 * Splits the page of a fallback shell into the prefix that holds its resolved
 * param values, and the path that follows.
 *
 * Returns undefined when the page resolves nothing, or when the resolved
 * segments are not consecutive from the first segment onwards.
 */ function splitShellPage(page, sourcePage) {
    const pageSegments = page.split('/');
    const sourceSegments = sourcePage.split('/');
    if (pageSegments.length !== sourceSegments.length) {
        return undefined;
    }
    const resolved = [];
    for(let index = 0; index < pageSegments.length; index++){
        if (pageSegments[index] !== sourceSegments[index]) {
            resolved.push(index);
        }
    }
    if (resolved.length === 0) {
        return undefined;
    }
    // A shell resolves the leading params of its source page, so the resolved
    // segments are consecutive and the first of them is the first segment of the
    // path. `split` returns an empty string at index 0, so they start at index 1.
    for(let position = 0; position < resolved.length; position++){
        if (resolved[position] !== position + 1) {
            return undefined;
        }
    }
    // The source page declares a param at each resolved position, and the shell
    // holds a value there. Anything else means the two pages differ for another
    // reason, and the leading segments are not a prefix of resolved values.
    for (const index of resolved){
        if (!sourceSegments[index].startsWith('[') || pageSegments[index].startsWith('[')) {
            return undefined;
        }
    }
    const tailStart = resolved.length + 1;
    return {
        prefix: pageSegments.slice(1, tailStart).join('/'),
        tail: pageSegments.slice(tailStart).join('/')
    };
}
function collectFallbackShellRuns(dynamicRoutes, hasFallbackFalse) {
    const runs = [];
    let current;
    for (const route of dynamicRoutes){
        // `pageToRoute` sets `sourcePage` only when the build passes it a source
        // page, and the build does that for a fallback shell. The field therefore
        // names the page whose path this shell repeats, and it is absent on every
        // other route.
        const { sourcePage } = route;
        const split = sourcePage && sourcePage !== route.page ? splitShellPage(route.page, sourcePage) : undefined;
        // This route is not a shell that a run can hold, so it ends the run in
        // progress.
        if (!sourcePage || !split) {
            current = undefined;
            continue;
        }
        const isFallbackFalse = hasFallbackFalse(route.page);
        if (current && (current.sourcePage !== sourcePage || current.tail !== split.tail || current.isFallbackFalse !== isFallbackFalse)) {
            current = undefined;
        }
        if (!current) {
            current = {
                sourcePage,
                tail: split.tail,
                isFallbackFalse,
                shells: []
            };
            runs.push(current);
        }
        current.shells.push({
            page: route.page,
            prefix: split.prefix
        });
    }
    const byRepresentativePage = new Map();
    const replacedPages = new Set();
    for (const run of runs){
        if (run.shells.length < 2) {
            continue;
        }
        // The caller replaces the escaped prefix at the start of the pattern for
        // the representative, so this function keeps the run only when that pattern
        // starts with the prefix.
        //
        // Two things make that true today. `getNamedRouteRegex` escapes each
        // segment the same way, and a fallback shell keeps at least one param
        // unresolved, so a slash always follows its prefix. This check holds the
        // run back if either stops being true.
        const [representative, ...replaced] = run.shells;
        const { namedRegex } = (0, _routeregex.getNamedRouteRegex)(representative.page, {
            prefixRouteKeys: true
        });
        if (!namedRegex.startsWith(`^/${(0, _escaperegexp.escapeStringRegexp)(representative.prefix)}/`)) {
            continue;
        }
        byRepresentativePage.set(representative.page, {
            prefixes: run.shells.map((shell)=>shell.prefix),
            tail: run.tail
        });
        for (const shell of replaced){
            replacedPages.add(shell.page);
        }
    }
    return {
        byRepresentativePage,
        replacedPages
    };
}

//# sourceMappingURL=fallback-shell-runs.js.map