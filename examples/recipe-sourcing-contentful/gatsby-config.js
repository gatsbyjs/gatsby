module.exports = {
  siteMetadata: {
    title: `Gatsby Contentful Recipe`,
    description: `Example Gatsby site sourcing data from Contentful.`,
    author: `@gatsbyjs`,
  },
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `90ctcp8fei0l`,
        accessToken: `nCFHCSL-z72KyOzRKIPSVpoyRClSugzKsNndVjXk8_A`,
      },
    },
  ],
}
