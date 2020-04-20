import meant from "meant"

export const KNOWN_CONFIG_KEYS = [
  // `__experimentalThemes`,
  // `polyfill`,
  // `assetPrefix`,
  // `pathPrefix`,
  // `siteMetadata`,
  // `mapping`,
  // `plugins`,
  // `proxy`,
  // `developMiddleware`,
  `plugins`,
]

export function didYouMean(configKey, commands = KNOWN_CONFIG_KEYS) {
  const bestSimilarity = meant(configKey, commands)

  if (bestSimilarity.length === 0) return `None`
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
