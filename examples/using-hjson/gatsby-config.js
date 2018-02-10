module.exports = {
  siteMetadata: {
    title: `gatsby-example-using-hjson`,
    description: `Blazing-fast React.js static site generator`,
  },
  plugins: [
    `gatsby-transformer-hjson`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/files`,
        name: `files`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/letters`,
        name: `letters`,
      },
    },
  ],
}
