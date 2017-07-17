module.exports = {
  siteMetadata: {
    title: `GatsbyJS RSS`,
    description: `A blog with RSS powered by GatsbyJS.`,
    siteUrl: `https://gatsbyjs.org`
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/posts`
      }
    },
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-plugin-sitemap`
    }
  ]
}
