module.exports = options => {
  let {disableThemeUiStyling = false} = options
  return {
    plugins: [
      {
        resolve: `gatsby-theme-blog-core`,
        options,
      },
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-twitter`,
      `gatsby-plugin-emotion`,
      !disableThemeUiStyling && {
        resolve: `gatsby-plugin-theme-ui`,
      }
    ].filter(Boolean)
  }
}
