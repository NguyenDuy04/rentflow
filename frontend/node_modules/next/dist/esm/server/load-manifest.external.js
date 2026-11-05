import { join } from 'path';
import { readFileSync } from 'fs';
import { runInNewContext } from 'vm';
import { deepFreeze } from '../shared/lib/deep-freeze';
const sharedCache = new Map();
export function loadManifest(path, shouldCache = true, cache = sharedCache, skipParse = false, handleMissing) {
    if (shouldCache && cache.has(path)) {
        return cache.get(path);
    }
    let manifest;
    if (handleMissing) {
        try {
            manifest = readFileSync(/* turbopackIgnore: true */ path, 'utf8');
        } catch (err) {
            let result = undefined;
            cache.set(path, result);
            return result;
        }
    } else {
        manifest = readFileSync(/* turbopackIgnore: true */ path, 'utf8');
    }
    if (!skipParse) {
        manifest = JSON.parse(manifest);
        // Freeze the manifest so it cannot be modified if we're caching it.
        if (shouldCache) {
            manifest = deepFreeze(manifest);
        }
    }
    if (shouldCache) {
        cache.set(path, manifest);
    }
    return manifest;
}
export function evalManifest(path, shouldCache = true, cache = sharedCache, handleMissing) {
    if (shouldCache && cache.has(path)) {
        return cache.get(path);
    }
    let content;
    if (handleMissing) {
        try {
            content = readFileSync(/* turbopackIgnore: true */ path, 'utf8');
        } catch (err) {
            let result = undefined;
            cache.set(path, result);
            return result;
        }
    } else {
        content = readFileSync(/* turbopackIgnore: true */ path, 'utf8');
    }
    if (content.length === 0) {
        throw new Error('Manifest file is empty');
    }
    let contextObject = {
        process: {
            env: {
                NEXT_DEPLOYMENT_ID: process.env.NEXT_DEPLOYMENT_ID
            }
        }
    };
    runInNewContext(content, contextObject);
    // Freeze the context object so it cannot be modified if we're caching it.
    if (shouldCache) {
        contextObject = deepFreeze(contextObject);
    }
    if (shouldCache) {
        cache.set(path, contextObject);
    }
    return contextObject;
}
export function evalManifestFromRelativePath({ projectDir, distDir, manifest, shouldCache, cache, handleMissing }) {
    const manifestPath = join(/* turbopackIgnore: true */ projectDir, distDir, manifest);
    return evalManifest(manifestPath, shouldCache, cache, handleMissing);
}
export function loadManifestFromRelativePath({ projectDir, distDir, manifest, shouldCache, cache, skipParse, handleMissing }) {
    const manifestPath = join(/* turbopackIgnore: true */ projectDir, distDir, manifest);
    return loadManifest(manifestPath, shouldCache, cache, skipParse, handleMissing);
}
export function clearManifestCache(path, cache = sharedCache) {
    return cache.delete(path);
}

//# sourceMappingURL=load-manifest.external.js.map