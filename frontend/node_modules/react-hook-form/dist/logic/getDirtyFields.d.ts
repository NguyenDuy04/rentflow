import type { FieldRefs } from '../types';
type DirtyFieldsTree = Record<string, unknown>;
export default function getDirtyFields<T>(data: T, formValues: T, dirtyFieldsFromValues?: DirtyFieldsTree, fieldRefs?: FieldRefs): DirtyFieldsTree;
export {};
//# sourceMappingURL=getDirtyFields.d.ts.map