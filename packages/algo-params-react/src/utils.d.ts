export declare function injectFormDataValues(
  rules: any[],
  formDataMap?: Record<string, any>,
): any[];

export declare function injectInfoToRules(
  rules: any[],
  infoFormatter?: ((rule: any) => string) | undefined,
): any[];

export declare function normalizePreviewRules(rules: any[]): any[];

export declare function hasSerializedFunctionMarker(value: unknown): boolean;

export declare function reviveSerializedFunctions<T = any>(value: T): T;
