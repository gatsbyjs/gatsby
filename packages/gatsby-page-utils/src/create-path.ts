import { parse, posix } from "path"
import { slash } from "gatsby-core-utils/path"

export function createPath(
  filePath: string,
  withTrailingSlash: boolean = false,
  usePathBase: boolean = false
): string {
  const { dir, name, base } = parse(filePath)
  // When a collection route also has client-only routes (e.g. {Product.name}/[...sku])
  // The "name" would be .. and "ext" .sku -- that's why "base" needs to be used instead
  // to get [...sku]. usePathBase is set to "true" in collection-route-builder and gatsbyPath
  const parsedBase = base === `index` ? `` : base
  const parsedName = name === `index` ? `` : name
  const postfix = withTrailingSlash ? `/` : ``

  // Convert slashes since the Regex operates on forward slashes
  return slash(
    posix.join(`/`, dir, usePathBase ? parsedBase : parsedName, postfix)
  )
}
