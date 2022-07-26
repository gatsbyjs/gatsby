import { parse, posix } from "path"

export function createPath(
  filePath: string,
  // TODO(v5): Set this default to false
  withTrailingSlash: boolean = true,
  usePathBase: boolean = false
): string {
  const { dir, name, base } = parse(filePath)
  // When a collection route also has client-only routes (e.g. {Product.name}/[...sku])
  // The "name" would be .. and "ext" .sku -- that's why "base" needs to be used instead
  // to get [...sku]. usePathBase is set to "true" in collection-route-builder and gatsbyPath
  const parsedBase = base === `index` ? `` : base
  const parsedName = name === `index` ? `` : name
  const postfix = withTrailingSlash ? `/` : ``

  return posix.join(`/`, dir, usePathBase ? parsedBase : parsedName, postfix)
}
