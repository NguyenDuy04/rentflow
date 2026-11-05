import fs from 'fs';
import path from 'path';
export function findDir(dir, name) {
    // prioritize ./${name} over ./src/${name}
    let curDir = path.join(dir, name);
    if (fs.existsSync(curDir)) return curDir;
    curDir = path.join(dir, 'src', name);
    if (fs.existsSync(curDir)) return curDir;
    return null;
}
export function findPagesDir(dir) {
    const pagesDir = findDir(dir, 'pages') || undefined;
    const appDir = findDir(dir, 'app') || undefined;
    if (appDir == null && pagesDir == null) {
        throw new Error("> Couldn't find any `pages` or `app` directory. Please create one under the project root");
    }
    if (pagesDir && appDir) {
        const pagesParent = path.dirname(pagesDir);
        const appParent = path.dirname(appDir);
        if (pagesParent !== appParent) {
            throw new Error('> `pages` and `app` directories should be under the same folder');
        }
    }
    return {
        pagesDir,
        appDir
    };
}

//# sourceMappingURL=find-pages-dir.js.map