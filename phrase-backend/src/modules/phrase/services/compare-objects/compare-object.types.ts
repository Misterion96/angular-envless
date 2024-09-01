export type TNestedObject = Record<string, string[] | boolean | number | string>;
export interface TCompareObjectsResult {
    added: string[];
    changed: string[];
    deleted: string[];
}
