const url = require(`url`)

// url.resolve adds a trailing slash if part #2 is defined but empty string
const stripTrailingSlash = part =>
  part.endsWith(`/`) ? part.slice(0, -1) : part

module.exports = function getPublicPath({
  assetPrefix,
  pathPrefix,
  prefixPaths,
}) {
  if (prefixPaths && (assetPrefix || pathPrefix)) {
    return stripTrailingSlash(
      url.resolve(...[assetPrefix, pathPrefix].map(part => part || ``))
    )
  }

  return ``
}
