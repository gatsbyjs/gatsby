module.exports = {
  siteMetadata: {
    title: `Gatsby MDX e2e`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {resolve: `gatsby-plugin-mdx`,
    options: {
      defaultLayouts: {
        default: require.resolve("./src/components/layout.js"),
      },
    }
  },
  ],
}
