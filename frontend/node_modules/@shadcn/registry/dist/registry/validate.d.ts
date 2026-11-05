type RegistryValidationDiagnostic = {
    registryFile: string;
    message: string;
    suggestion?: string;
    itemName?: string;
    itemIndex?: number;
    includePath?: string;
    filePath?: string;
};
declare function validateRegistry(options: {
    cwd: string;
    registryFile: string;
}): Promise<{
    valid: boolean;
    cwd: string;
    registryFiles: number;
    registryFilePaths: string[];
    items: number;
    diagnostics: RegistryValidationDiagnostic[];
}>;

export { validateRegistry };
