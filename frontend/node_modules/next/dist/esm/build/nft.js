import path from 'path';
function invalid(message) {
    throw new Error(`Invalid NFT metadata: ${message}`);
}
function isRelativePathInside(relative) {
    return relative === '' || !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`);
}
function relativePathIfInside(root, candidate) {
    const relative = path.relative(root, candidate);
    return isRelativePathInside(relative) ? relative : undefined;
}
function mapBasePath(traceFileDirectory, baseRoot, relativePath) {
    const source = path.resolve(traceFileDirectory, relativePath);
    return {
        source,
        destination: path.relative(baseRoot, source)
    };
}
function mapBasePathInsideRoot(traceFileDirectory, baseRoot, relativePath) {
    const mapped = mapBasePath(traceFileDirectory, baseRoot, relativePath);
    if (!isRelativePathInside(mapped.destination)) {
        invalid(`path ${JSON.stringify(relativePath)} escapes the base root`);
    }
    return mapped;
}
function mapAdditionalRootPath(traceFileDirectory, root, relativePath) {
    const rootPath = path.resolve(traceFileDirectory, root.path);
    const source = path.resolve(rootPath, relativePath);
    if (relativePathIfInside(rootPath, source) === undefined) {
        invalid(`path ${JSON.stringify(relativePath)} escapes additional root ${root.name}`);
    }
    return {
        source,
        destination: path.join('next_additional_roots', root.name, relativePath)
    };
}
export function mapNftFileEntries(nft, traceFilePath, baseRoot, options) {
    const traceFileDirectory = path.dirname(traceFilePath);
    const roots = nft.additionalRoots ?? [];
    const result = [];
    const mapList = (list, currentRootIndex)=>{
        // The list of symlinks is always in sorted order (by file index)
        const { files, fileHashes } = list;
        const symlinks = list.symlinks ?? [];
        let symlinkCursor = 0;
        let nextSymlink = symlinks[symlinkCursor];
        for(let fileIndex = 0; fileIndex < files.length; fileIndex++){
            const file = files[fileIndex];
            let symlink;
            if ((nextSymlink == null ? void 0 : nextSymlink[0]) === fileIndex) {
                symlink = nextSymlink;
                nextSymlink = symlinks[++symlinkCursor];
            }
            // a currentRootIndex of -1 denotes a path relative to the *.nft.json file
            // (i.e. not an additional root)
            const mapped = currentRootIndex === -1 ? mapBasePath(traceFileDirectory, baseRoot, file) : mapAdditionalRootPath(traceFileDirectory, roots[currentRootIndex], file);
            if (currentRootIndex === -1 && (options == null ? void 0 : options.skipBaseRootEscapes) && !isRelativePathInside(mapped.destination)) {
                options.onBaseRootEscape == null ? void 0 : options.onBaseRootEscape.call(options, mapped.source);
                continue;
            }
            let symlinkTarget;
            let symlinkCrossesRoot = false;
            if (symlink !== undefined) {
                const [, target, rootIndex] = symlink;
                symlinkCrossesRoot = rootIndex !== undefined;
                const targetRootIndex = rootIndex ?? currentRootIndex;
                symlinkTarget = targetRootIndex === -1 ? ((options == null ? void 0 : options.skipBaseRootEscapes) ? mapBasePathInsideRoot(traceFileDirectory, baseRoot, target) : mapBasePath(traceFileDirectory, baseRoot, target)).destination : mapAdditionalRootPath(traceFileDirectory, roots[targetRootIndex], target).destination;
            }
            result.push({
                source: mapped.source,
                destination: mapped.destination,
                hash: fileHashes == null ? void 0 : fileHashes[fileIndex],
                symlinkTarget,
                symlinkCrossesRoot
            });
        }
    };
    mapList(nft, -1);
    for(let rootIndex = 0; rootIndex < roots.length; rootIndex++){
        mapList(roots[rootIndex], rootIndex);
    }
    return result;
}
export function resolveNftOutputPath(outputRoot, destination) {
    const outputPath = path.resolve(outputRoot, destination);
    if (relativePathIfInside(outputRoot, outputPath) === undefined) {
        invalid(`output path ${JSON.stringify(destination)} escapes the deployment root`);
    }
    return outputPath;
}

//# sourceMappingURL=nft.js.map