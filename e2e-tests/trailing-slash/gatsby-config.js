const trailingSlash = process.env.TRAILING_SLASH || `ignore`
console.info(`TrailingSlash: ${trailingSlash}`)

module.exports = {
  trailingSlash,
  siteMetadata: {
    siteMetadata: {
      siteUrl: `https://www.domain.tld`,
      title: `Trailing Slash`,
    },
  },
}
