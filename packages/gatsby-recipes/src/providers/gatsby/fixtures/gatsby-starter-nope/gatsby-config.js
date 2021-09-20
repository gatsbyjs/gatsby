const dynamic = [`harry-potter`]

module.exports = {
  siteMetadata: {
    title: `this shouldn't work because it's a config format we don't support`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: `pages`,
      },
    },
  ]
    .filter(Boolean)
    .concat(dynamic),
}
