//#region src/index.d.ts
/** A message's path through its file: numbers are array indices. */
type ValueSegments = Array<string | number>;
declare const _default: () => {
  decode(content: string, context: {
    locale: string;
    sourceLocale: string;
  }): {
    verbatim?: {
      value: boolean | number;
    } | undefined;
    id: string;
    message: string;
    references: never[];
    description: never[];
    segments: ValueSegments;
  }[];
  encode(messages: {
    [key: string]: unknown;
    id: string;
    message: string;
    description: Array<string>;
    references: Array<{
      path: string;
      line?: number;
    }>;
    segments?: Array<string | number>;
    verbatim?: {
      value: unknown;
    };
    orphan?: boolean;
  }[], context: {
    locale: string;
    sourceMessagesById: Map<string, {
      [key: string]: unknown;
      id: string;
      message: string;
      description: Array<string>;
      references: Array<{
        path: string;
        line?: number;
      }>;
      segments?: Array<string | number>;
      verbatim?: {
        value: unknown;
      };
      orphan?: boolean;
    }>;
  }): string;
};
//#endregion
export { _default as default };