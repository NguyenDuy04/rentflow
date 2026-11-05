declare const TARGET_ALIAS_KEYS: readonly ["components", "ui", "lib", "hooks"];
type TargetAliasKey = (typeof TARGET_ALIAS_KEYS)[number];
declare function isTargetAliasKey(key: string): key is TargetAliasKey;
declare function getTargetAliasKey(target?: string): TargetAliasKey | null;

export { TARGET_ALIAS_KEYS, type TargetAliasKey, getTargetAliasKey, isTargetAliasKey };
