module.exports = {
  __experimentalThemes: [
    {
      resolve: `gatsby-theme-notes`,
      options: {
        mdx: false,
      },
    },
    // with gatsby-theme-ui, the last theme in the config
    // will override the theme-ui context from other themes
    { resolve: `gatsby-theme-blog`, },
  ],
  siteMetadata: {
    title: `Shadowed Site Title`,
  },
}
