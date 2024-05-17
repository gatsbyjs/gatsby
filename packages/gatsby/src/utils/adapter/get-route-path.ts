import type { IGatsbyFunction, IGatsbyPage } from "../../redux/types"

function maybeDropNamedPartOfWildcard(
  path: string | undefined
): string | undefined {
  if (!path) {
    return path
  }

  // Replaces `/foo/*bar` with `/foo/*`
  return path.replace(/\*.+$/, `*`)
}

export function getRoutePathFromPage(
  page: Pick<IGatsbyPage, "path" | "matchPath">
): string {
  return maybeDropNamedPartOfWildcard(page.matchPath) ?? page.path
}

export function getRoutePathFromFunction(
  functionInfo: IGatsbyFunction
): string {
  return (
    maybeDropNamedPartOfWildcard(functionInfo.matchPath) ??
    functionInfo.functionRoute
  )
}
