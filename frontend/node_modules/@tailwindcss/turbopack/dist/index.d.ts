import { LoaderContext } from 'webpack';

interface LoaderOptions {
    /**
     * The base directory to scan for class candidates.
     *
     * Defaults to the current working directory.
     */
    base?: string;
    /**
     * Optimize and minify the output CSS.
     */
    optimize?: boolean | {
        minify?: boolean;
    };
}
declare function tailwindLoader(this: LoaderContext<LoaderOptions>, source: string): Promise<void>;

export = tailwindLoader;
