require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

exports.default = {
  siteMetadata: {
    title: `GatsbyJS`,
    siteUrl: `https://www.gatsbyjs.org`,
    description: `Blazing fast modern site generator for React`,
    twitter: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-theme-gatsbyjs-website`,
    // {
    //   resolve: `gatsby-source-filesystem`,
    //   options: {
    //     name: `docs`,
    //     path: `${__dirname}/../docs/`,
    //   },
    // },
    // {
    //   resolve: `gatsby-source-filesystem`,
    //   options: {
    //     name: `gatsby-core`,
    //     path: `${__dirname}/../packages/gatsby/`,
    //     ignore: [`**/dist/**`],
    //   },
    // },
    {
      resolve: `gatsby-plugin-perf-metrics`,
      options: {
        appId: `1:216044356421:web:92185d5e24b3a2a1`,
      },
    },
  ],
}
