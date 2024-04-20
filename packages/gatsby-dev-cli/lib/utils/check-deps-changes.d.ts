/**
 * Compare dependencies of installed packages and monorepo package.
 * It will skip dependencies that are removed in monorepo package.
 *
 * If local package is not installed, it will check unpkg.com.
 * This allow gatsby-dev to skip publishing unnecesairly and
 * let install packages from public npm repository if nothing changed.
 */
export declare function checkDepsChanges({ newPath, packageName, monoRepoPackages, isInitialScan, ignoredPackageJSON, packageNameToPath, }: {
    newPath: any;
    packageName: any;
    monoRepoPackages: any;
    isInitialScan: any;
    ignoredPackageJSON: any;
    packageNameToPath: any;
}): Promise<{
    didDepsChanged: boolean;
    packageNotInstalled: boolean;
}>;
