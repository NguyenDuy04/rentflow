//#region packages/intl-localematcher/abstract/LookupSupportedLocales.d.ts
/**
 * https://tc39.es/ecma402/#sec-lookupsupportedlocales
 * @param availableLocales
 * @param requestedLocales
 */
export declare function LookupSupportedLocales(availableLocales: string[], requestedLocales: string[]): string[];
//#endregion
//#region packages/intl-localematcher/abstract/ResolveLocale.d.ts
interface ResolveLocaleResult {
  locale: string;
  dataLocale: string;
  [k: string]: any;
}
/**
 * https://tc39.es/ecma402/#sec-resolvelocale
 */
export declare function ResolveLocale<K extends string, D extends { [k in K]: any; }>(availableLocales: Set<string> | readonly string[], requestedLocales: readonly string[], options: {
  localeMatcher: string;
  [k: string]: string | null | undefined;
}, relevantExtensionKeys: K[], localeData: Record<string, D | undefined>, getDefaultLocale: () => string): ResolveLocaleResult;
//#endregion
//#region packages/intl-localematcher/index.d.ts
export interface Opts {
  algorithm: "lookup" | "best fit";
}
export declare function match(requestedLocales: readonly string[], availableLocales: readonly string[], defaultLocale: string, opts?: Opts): string;
//#endregion
//# sourceMappingURL=index.d.ts.map