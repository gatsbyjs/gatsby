module.exports = {
  siteMetadata: {
    title: `gatsby-example-using-csv`,
    description: `Blazing fast modern site generator for React`,
  },
  plugins: [
    `gatsby-transformer-csv`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data`,
        name: `data`,
      },
    },
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        // bucketName: '<your-s3-bucket>',
      },
    },
  ],
}
