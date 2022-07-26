module.exports = ({ catchLinks = true }) => {
  const plugins = [`gatsby-plugin-image`, `gatsby-plugin-sharp`]

  if (catchLinks) {
    plugins.push(`gatsby-plugin-catch-links`)
  }

  return {
    plugins,
  }
}
