export * from '@shadcn/registry/internal/icons/libraries';

interface ParsedImport {
    moduleSpecifier: string;
    namedImports: string[];
}
interface ParsedUsage {
    componentName: string;
    iconAttribute?: string;
    attributes: Record<string, string>;
}
declare function parseImportTemplate(template: string): ParsedImport[];
declare function getIconModuleSpecifier(template: string): string | undefined;
declare function parseUsageTemplate(usage: string): ParsedUsage;

export { type ParsedImport, type ParsedUsage, getIconModuleSpecifier, parseImportTemplate, parseUsageTemplate };
