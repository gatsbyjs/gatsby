import path from "path"

export function createNormalizedModuleKey(
  resourcePath: string,
  rootContext: string
): string {
  const rootRelative = resourcePath.replace(rootContext, ``)
  const [rootRelativeDir, potentialModuleName] = rootRelative
    .split(path.sep)
    .filter(Boolean)
  const isNodeModule = rootRelativeDir === `node_modules`
  return isNodeModule
    ? `file://${path.join(`node_modules`, potentialModuleName)}`
    : resourcePath
}
