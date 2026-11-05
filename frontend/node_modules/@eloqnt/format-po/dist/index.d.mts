//#region src/index.d.ts
declare const _default: () => {
  decode(content: string, context: {
    locale: string;
    sourceLocale: string;
  }): {
    formatPoEmptySource?: string | undefined;
    formatPoContext?: string | undefined;
    id: string;
    message: string;
    description: string[];
    references: {
      path: string;
      line?: number;
    }[];
    flags?: Array<string>;
  }[];
  encode(messages: {
    [key: string]: unknown;
    id: string;
    message: string;
    description: Array<string>;
    references: Array<{
      path: string;
      line?: number;
      column?: number;
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
        column?: number;
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