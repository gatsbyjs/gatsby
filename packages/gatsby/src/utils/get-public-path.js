const url = require(`url`)

module.exports = function getPublicPath(
  { assetPrefix, pathPrefix, prefixPaths },
  fallback = `/`
) {
  if (prefixPaths && (assetPrefix || pathPrefix)) {
    return url.resolve(...[assetPrefix, pathPrefix].map(part => part || ``))
  }

  return fallback
}
