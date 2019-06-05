module.exports = {
  __experimentalThemes: [
    {
      resolve: `gatsby-theme-notes`,
      options: {
        mdx: false,
      },
    },
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
  ],
  siteMetadata: {
    title: `Shadowed Site Title`,
  },
}
