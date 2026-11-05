declare function parseRegistryAndItemFromString(name: string): {
    registry: null;
    item: string;
} | {
    registry: string;
    item: string;
};

export { parseRegistryAndItemFromString };
