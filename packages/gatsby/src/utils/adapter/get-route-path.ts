import { IGatsbyFunction, IGatsbyPage } from "../../internal"

function maybeDropNamedPartOfWildcard(
  path: string | undefined
): string | undefined {
  if (!path) {
    return path
  }

  return path.replace(/\*.+$/, `*`)
}

export function getRoutePathFromPage(page: IGatsbyPage): string {
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
