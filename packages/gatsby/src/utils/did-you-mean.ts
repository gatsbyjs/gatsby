import meant from "meant"

export const KNOWN_CONFIG_KEYS = [
  `flags`,
  `polyfill`,
  `assetPrefix`,
  `pathPrefix`,
  `siteMetadata`,
  `mapping`,
  `plugins`,
  `proxy`,
  `developMiddleware`,
  `jsxRuntime`,
  `jsxImportSource`,
  `trailingSlash`,
  `graphqlTypegen`,
  `headers`,
  `adapter`,
]

export function didYouMean(
  configKey: string,
  commands: Array<string> = KNOWN_CONFIG_KEYS
): string {
  const bestSimilarity = meant(configKey, commands)

  if (bestSimilarity.length === 0) return ``
  if (bestSimilarity.length === 1) {
    return `Did you mean "${bestSimilarity[0]}"?`
  } else {
    return (
      [`Did you mean one of these?`]
        .concat(bestSimilarity.slice(0, 3))
        .join(`\n`) + `\n`
    )
  }
}

export default didYouMean
