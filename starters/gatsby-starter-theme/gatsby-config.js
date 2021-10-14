module.exports = {
  siteMetadata: {
    title: `Shadowed Site Title`,
  },
  plugins: [
    {
      resolve: `gatsby-theme-notes`,
      options: {
        mdx: false,
        basePath: `/notes`,
      },
    },
    // with gatsby-plugin-theme-ui, the last theme in the config
    // will override the theme-ui context from other themes
    { resolve: `gatsby-theme-blog` },
  ],
}
