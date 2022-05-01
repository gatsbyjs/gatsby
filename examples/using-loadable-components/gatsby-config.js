module.exports = {
  siteMetadata: {
    title: `Gatsby + Loadable Components Example`,
    description: `How to code-split at the component level with loadable-components and maintain SSR with Gatsby.`,
    author: `Grayson Hicks`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    `gatsby-plugin-loadable-components-ssr`,
    {
      resolve: `gatsby-plugin-perf-budgets`,
      options: {
        devMode: true,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-gatsby-cloud`,
  ],
}
