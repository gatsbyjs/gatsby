/**
 * Recursively get set of packages that depend on given package.
 * Set also includes passed package.
 */
export declare function getDependantPackages({ packageName, depTree, packagesToPublish, }: {
    packageName: string;
    depTree: Record<string, Array<string>>;
    packagesToPublish?: Set<string> | undefined;
}): Set<string>;
