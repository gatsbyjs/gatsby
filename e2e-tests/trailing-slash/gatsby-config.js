let hasBeenLogged = false
const trailingSlash = process.env.TRAILING_SLASH || `legacy`

if (!hasBeenLogged) {
  console.info(`TrailingSlash: ${trailingSlash}`)
  hasBeenLogged = true
}

module.exports = {
  trailingSlash,
  siteMetadata: {
    siteMetadata: {
      siteUrl: `https://www.domain.tld`,
      title: `Trailing Slash`,
    },
  },
}
