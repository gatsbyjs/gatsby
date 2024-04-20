/**
 * @typedef {Object} TraversePackagesDepsReturn
 * @property {Object} depTree Lookup table to check dependants for given package.
 * Used to determine which packages need to be published.
 * @example
 * ```
 * {
 *   "gatsby-cli": Set(["gatsby"]),
 *   "gatsby-telemetry": Set(["gatsby", "gatsby-cli"]),
 *   "gatsby-source-filesystem": Set(["gatsby-source-contentful", "gatsby-source-drupal", "gatsby-source-wordpress", etc])
 *   // no package have remark plugin in dependencies - so dependent list is empty
 *   "gatsby-transformer-remark": Set([])
 * }
 * ```
 */
/**
 * Compile final list of packages to watch
 * This will include packages explicitly defined packages and all their dependencies
 * Also creates dependency graph that is used later to determine which packages
 * would need to be published when their dependencies change
 * @param {Object} $0
 * @param {String} $0.root Path to root of Gatsby monorepo repository
 * @param {String[]} $0.packages Initial array of packages to watch
 * This can be extracted from project dependencies or explicitly set by `--packages` flag
 * @param {String[]} $0.monoRepoPackages Array of packages in Gatsby monorepo
 * @param {String[]} [$0.seenPackages] Array of packages that were already traversed.
 * This makes sure dependencies are extracted one time for each package and avoid any
 * infinite loops.
 * @param {DepTree} [$0.depTree] Used internally to recursively construct dependency graph.
 * @return {TraversePackagesDepsReturn}
 */
export declare function traversePackagesDeps({ packages, monoRepoPackages, seenPackages, depTree, packageNameToPath, }: {
    packages: Array<string>;
    monoRepoPackages: Array<string>;
    seenPackages?: Array<string> | undefined;
    depTree?: any | undefined;
    packageNameToPath: Map<string, string>;
}): {
    seenPackages: Array<string>;
    depTree: any;
};
