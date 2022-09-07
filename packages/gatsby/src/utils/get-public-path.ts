const trimSlashes = (part: string): string => part.replace(/(^\/)|(\/$)/g, ``)

const isURL = (possibleUrl: string): boolean =>
  [`http://`, `https://`, `//`].some(expr => possibleUrl.startsWith(expr))

export const getPublicPath = ({
  assetPrefix,
  pathPrefix,
  prefixPaths,
}: {
  assetPrefix?: string
  pathPrefix?: string
  prefixPaths?: boolean
}): string => {
  if (prefixPaths && (assetPrefix || pathPrefix)) {
    const normalized = [assetPrefix, pathPrefix]
      .filter((part): part is string => (part ? part.length > 0 : false))
      .map(part => trimSlashes(part))
      .join(`/`)

    return isURL(normalized) ? normalized : `/${normalized}`
  }

  return ``
}
