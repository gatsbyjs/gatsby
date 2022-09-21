import path from "path"

/**
 * Create a normalized module key that is referenced in both the partial hydration webpack loader and plugin.
 * This solves for module imports that may be differently bundled for different environments (e.g. browser, node).
 *
 * @param resourcePath Absolute path to the resource
 * @param rootContext Absolute path to project root
 * @returns Normalized module key
 */
export function createNormalizedModuleKey(
  resourcePath: string,
  rootContext: string
): string {
  const rootRelative = resourcePath.replace(rootContext, ``)
  const [rootRelativeDir, potentialModuleName] = rootRelative
    .split(path.sep)
    .filter(Boolean)
  return rootRelativeDir === `node_modules`
    ? `file://${path.join(`node_modules`, potentialModuleName)}`
    : resourcePath
}
