module.exports = {
  siteMetadata: {
    title: `gatsby-example-using-excel`,
    description: `Blazing-fast React.js static site generator`,
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
