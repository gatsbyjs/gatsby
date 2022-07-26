module.exports = {
  siteMetadata: {
    title: `Using MDX example`,
    description: `Kick off your next, great Gatsby project with MDX.`,
    author: `@pragmaticpat`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 690,
            },
          },
        ],
      }
    }
  ],
}
