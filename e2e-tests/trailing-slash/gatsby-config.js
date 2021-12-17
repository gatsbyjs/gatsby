console.log('env var', process.env.TRAILING_SLASH)

module.exports = {
  trailingSlash: process.env.TRAILING_SLASH || `legacy`,
  siteMetadata: {
    siteMetadata: {
      siteUrl: `https://www.domain.tld`,
      title: `Trailing Slash`,
    },
  },
}
