module.exports = {
  siteMetadata: {
    title: `gatsby-example-using-excel`,
    description: `Blazing fast modern site generator for React`,
  },
  plugins: [
    `gatsby-transformer-excel`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data`,
        name: `data`,
      },
    },
  ],
}
