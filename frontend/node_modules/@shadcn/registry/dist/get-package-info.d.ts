import { PackageJson } from 'type-fest';

declare function getPackageInfo(cwd?: string, shouldThrow?: boolean): PackageJson | null;

export { getPackageInfo };
