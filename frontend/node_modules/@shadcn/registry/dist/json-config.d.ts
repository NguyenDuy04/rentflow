type JsonConfigResult = {
    config: unknown;
    filepath: string;
} | null;
declare function createJsonConfigExplorer(options: {
    filename: string;
    property?: string;
}): {
    search(dir: string): Promise<JsonConfigResult>;
    load(filepath: string): Promise<JsonConfigResult>;
    clearCaches(): void;
};

export { type JsonConfigResult, createJsonConfigExplorer };
