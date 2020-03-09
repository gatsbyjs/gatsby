import ConfigStore from "configstore"

/**
 * Encrypts an input using md5 hash of hexadecimal digest.
 *
 * @param {*} input The input to encrypt
 * @return {string} The content digest
 */
export declare function createContentDigest(input: any): string

/**
 * Joins all given path segments and converts
 * @param {string[]} paths A sequence of path segments
 */
export declare function joinPath(...paths: string[]): string

/**
 * Convert Windows backslash paths to slash paths: foo\\bar ➔ foo/bar
 * @param {string} path
 */
export declare function slash(path: string): string

/**
 * Checks if the file name matches a node path
 * @param {string} fileName File name
 */
export declare function isNodeInternalModulePath(fileName: string): boolean

/**
 * Calculate CPU core count
 *
 * @param {boolean} ignoreEnvVar Ignore the 'GATSBY_CPU_COUNT' env var to calculate the requested type of CPU cores
 * @return {number} Count of the requested type of CPU cores. Defaults to number of physical cores or 1
 */
export declare function cpuCoreCount(ignoreEnvVar?: boolean): number

/**
 * Joins all given segments and converts using a forward slash (/) as a delimiter
 * @param {string[]} segments A sequence of segments
 */
export declare function urlResolve(...segments: string[]): string

/**
 * Determines whether the environment where the code is running is in CI
 * @return {boolean} true if the environment is in CI, false otherwise
 */
export declare function isCI(): boolean

/**
 * Gets the name of the CI environment (e.g. "ZEIT Now", "Heroku", etc.)
 * @return {string | null} The name of the CI if available. Defaults to null if not in CI
 */
export declare function getCIName(): string | null

/**
 * Gets the configstore instance related to gatsby
 * @return {ConfigStore} the ConfigStore instance for gatsby
 */
export declare function getConfigStore(): ConfigStore

/**
 * Gets the version of the installed gatsby from node_modules
 * @return {string} the version string of the installed gatsby
 */
export declare function getGatsbyVersion(): string
