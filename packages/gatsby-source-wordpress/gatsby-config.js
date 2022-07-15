const plugins = [`gatsby-plugin-image`,
`gatsby-plugin-sharp`]

if (process.env.WORDPRESS_CATCH_LINKS !== `false`) {
  plugins.push(`gatsby-plugin-catch-links`)
}

module.exports = {
  plugins,
}
