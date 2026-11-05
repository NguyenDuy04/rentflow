import { parseLoaderTree } from '../../../shared/lib/router/utils/parse-loader-tree';
import { getLayoutOrPageModule } from '../../lib/app-dir-module';
/**
 * The outcome of resolving a route's `ensureStatic` config.
 * The ordering is intentional -- higher values indicate a
 * more constrained route that forces more request kinds to be static.
 *
 * A constraint also implies all its predecessors:
 * - `Prefetch` implies `Shell`, i.e. if prefetches are static, so are shells.
 * - `Navigation` implies `Prefetch` and `Shell`, i.e. if the whole page is static,
 *   then so are its shells and prefetches.
 *
 * Note that this flattens `"auto"` and `false` into `None`.
 * This is because rendering code does not need to distinguish them --
 * both indicate that the route follows normal Partial Prefetching semantics
 * and does not force anything to be static.
 * However, it is only correct to collapse them into one *after* resolving the
 * config for the entire route, because they have different interactions with
 * configs from other segments on the same route.
 */ export var EnsureStaticLevel = /*#__PURE__*/ function(EnsureStaticLevel) {
    /** The route follows standard Partial Prefetching semantics. */ EnsureStaticLevel[EnsureStaticLevel["None"] = 0] = "None";
    /** The route requires that app shells must be statically prerendered. */ EnsureStaticLevel[EnsureStaticLevel["Shell"] = 1] = "Shell";
    /** The route requires that app shells and prefetches must be statically prerendered. */ EnsureStaticLevel[EnsureStaticLevel["Prefetch"] = 2] = "Prefetch";
    /** The route requires that app shells, prefetches, and the whole page must be statically prerendered. */ EnsureStaticLevel[EnsureStaticLevel["Navigation"] = 3] = "Navigation";
    return EnsureStaticLevel;
}({});
function getEnsureStaticLevel(ensureStatic) {
    switch(ensureStatic){
        case 'auto':
        case false:
            {
                return 0;
            }
        case 'shell':
            {
                return 1;
            }
        case 'prefetch':
            {
                return 2;
            }
        case 'navigation':
            {
                return 3;
            }
    }
}
export async function resolveEnsureStaticLevel(tree, partialPrefetching) {
    return getEnsureStaticLevel(await resolveEnsureStaticConfig(tree, partialPrefetching));
}
export async function resolveEnsureStaticConfig(tree, partialPrefetching) {
    let { config, filePath } = await resolveEnsureStaticConfigImpl(tree);
    if (!partialPrefetching) {
        // If Partial Prefetching is not enabled for this route, we only support
        // a subset of `ensureStatic` values.
        // (We error in `getAppPageStaticInfo` if `ensureStatic` is used without enabling
        // Cache Components, so we don't have to assert that here)
        switch(config){
            case 'auto':
                {
                    // Default to the equivalent of Cache Components prefetching behavior.
                    config = 'prefetch';
                    break;
                }
            case false:
            case 'shell':
                {
                    // Not meaningful in Cache Components without Partial Prefetching
                    const originalConfig = config;
                    config = 'prefetch';
                    console.warn(`${formatEnsureStaticExport(originalConfig)} has no effect unless the route is using Partial Prefetching.` + `\n  (from: ${filePath})`);
                    break;
                }
            case 'prefetch':
                break;
            case 'navigation':
                break;
            default:
                config;
        }
    }
    if (config === false) {
        // `false` and "auto" are equivalent once resolved.
        return 'auto';
    } else {
        return config;
    }
}
async function resolveEnsureStaticConfigImpl(tree) {
    const { mod: layoutOrPageMod, filePath } = await getLayoutOrPageModule(tree);
    const config = getEnsureStaticConfigForModule(layoutOrPageMod);
    const parentResult = {
        config,
        filePath: filePath ?? null
    };
    // Walk the slots if any and validate that they don't have incompatible configs
    // with each other. If compatible, pick the most constrained value from the slots.
    let slotsResult = null;
    let slotResultKey = null;
    const { parallelRoutes } = parseLoaderTree(tree);
    for(const parallelRouteKey in parallelRoutes){
        const parallelRoute = parallelRoutes[parallelRouteKey];
        const childResult = await resolveEnsureStaticConfigImpl(parallelRoute);
        if (!slotsResult) {
            slotsResult = childResult;
            slotResultKey = parallelRouteKey;
        } else {
            // Check if the child is compatible with the current result for the slots.
            switch(compareEnsureStatic(childResult.config, slotsResult.config)){
                case 2:
                    {
                        // 'auto' is compatible with anything, but if the current result is 'auto' and the new one isn't,
                        // we want to use the more specific result.
                        if (slotsResult.config === 'auto' && childResult.config !== 'auto') {
                            slotsResult = childResult;
                            slotResultKey = parallelRouteKey;
                        }
                        break;
                    }
                case 4:
                case 1:
                case 3:
                    {
                        throw new Error(`Parallel slots cannot have incompatible \`ensureStatic\`.` + `\n  ${formatParallelSlot(slotResultKey)}: ` + `\n    ${formatEnsureStaticExport(slotsResult.config)}` + `\n    (from: ${slotsResult.filePath})` + `\n` + `\n  ${formatParallelSlot(parallelRouteKey)}: ` + `\n    ${formatEnsureStaticExport(childResult.config)}` + `\n    (from: ${childResult.filePath})` + `\n` + `\n Possible fixes:` + `\n - Remove one of the \`ensureStatic\` exports` + `\n - Change one of the  \`ensureStatic\` exports to match the other`);
                    }
            }
        }
    }
    // Child segments can override the config from the parent with a more constrained value,
    // but they cannot have a less constrained value.
    if (!slotsResult) {
        return parentResult;
    } else {
        const comparison = compareEnsureStatic(slotsResult.config, parentResult.config);
        switch(comparison){
            case 2:
                {
                    // 'auto' is compatible with anything, but if the parent result is 'auto' and the slots one isn't,
                    // we want to use the more constrained result.
                    if (parentResult.config === 'auto' && slotsResult.config !== 'auto') {
                        return slotsResult;
                    } else {
                        return parentResult;
                    }
                }
            case 3:
                {
                    return slotsResult;
                }
            case 1:
            case 4:
                {
                    throw new Error((comparison === 1 ? `A child segment cannot override a parent segment with a less-constrained \`ensureStatic\`.` : `A child segment cannot override a parent segment with an incompatible \`ensureStatic\`.`) + `\n  Parent has: ` + `\n    ${formatEnsureStaticExport(parentResult.config)}` + `\n    (from: ${parentResult.filePath})` + `\n  Child has: ` + `\n    ${formatEnsureStaticExport(slotsResult.config)}` + `\n    (from: ${slotsResult.filePath})` + `\n` + `\n Possible fixes:` + `\n - Remove one of the \`ensureStatic\` exports` + `\n - Change one of the  \`ensureStatic\` exports to match the other`);
                }
        }
    }
}
function formatParallelSlot(slot) {
    return slot === 'children' ? slot : `@${slot}`;
}
function formatEnsureStaticExport(config) {
    return `export const ensureStatic = ${JSON.stringify(config)}`;
}
var Comparison = /*#__PURE__*/ function(Comparison) {
    Comparison[Comparison["LessConstrained"] = 1] = "LessConstrained";
    Comparison[Comparison["Compatible"] = 2] = "Compatible";
    Comparison[Comparison["MoreConstrained"] = 3] = "MoreConstrained";
    Comparison[Comparison["Incompatible"] = 4] = "Incompatible";
    return Comparison;
}(Comparison || {});
const ENSURE_STATIC_ORDER = [
    'shell',
    'prefetch',
    'navigation'
];
function compareEnsureStatic(left, right) {
    // 'auto' is compatible with everything.
    if (left === 'auto' || right === 'auto') {
        return 2;
    }
    // `false` is compatible with false.
    if (left === false && right === false) {
        return 2;
    }
    // If only one of the values is `false` (we know it's not both), it's incompatible.
    if (left === false || right === false) {
        return 4;
    }
    const leftSort = ENSURE_STATIC_ORDER.indexOf(left);
    const rightSort = ENSURE_STATIC_ORDER.indexOf(right);
    return leftSort < rightSort ? 1 : leftSort === rightSort ? 2 : 3;
}
function getEnsureStaticConfigForModule(mod) {
    return (mod ? mod.ensureStatic : undefined) ?? 'auto';
}

//# sourceMappingURL=ensure-static.js.map