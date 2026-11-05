import { Config } from '../get-config.js';
import { searchResultsSchema } from './schema.js';
import { z } from 'zod';
import '../json-config.js';
import '../preset/preset.js';

declare function resolveSearchRegistries(registries: string[], config?: Partial<Config>): string[];
declare const SEARCH_CONCURRENCY = 8;
type SearchRegistriesOptions = {
    query?: string;
    types?: string[];
    limit?: number;
    offset?: number;
    config?: Partial<Config>;
    useCache?: boolean;
    continueOnError?: boolean;
};
declare function searchRegistries(registries: string[], options?: SearchRegistriesOptions): Promise<{
    pagination: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    };
    items: {
        name: string;
        registry: string;
        addCommandArgument: string;
        title?: string | undefined;
        type?: string | undefined;
        description?: string | undefined;
    }[];
    errors?: {
        registry: string;
        message: string;
    }[] | undefined;
}>;
declare function buildRegistryItemNameFromRegistry(name: string, registry: string): string;
declare const SEARCH_RESULT_DESCRIPTION_MAX_LENGTH = 80;
declare function formatSearchResultType(type?: string): string;
declare function toRegistryItemType(type: string): string;
declare const SEARCHABLE_TYPES: string[];
declare function findUnknownSearchTypes(types: string[]): string[];
declare function formatSearchResultDescription(description: string, maxLength?: number): string;
declare function printSearchResults(results: z.infer<typeof searchResultsSchema>, options: {
    query?: string;
    types?: string[];
    registries: string[];
}): void;

export { SEARCHABLE_TYPES, SEARCH_CONCURRENCY, SEARCH_RESULT_DESCRIPTION_MAX_LENGTH, buildRegistryItemNameFromRegistry, findUnknownSearchTypes, formatSearchResultDescription, formatSearchResultType, printSearchResults, resolveSearchRegistries, searchRegistries, toRegistryItemType };
