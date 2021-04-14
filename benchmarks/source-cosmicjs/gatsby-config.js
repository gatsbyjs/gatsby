require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby Cosmic JS Benchmark`,
  },
  plugins: [
    `gatsby-plugin-benchmark-reporting`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-source-cosmicjs`,
      options: {
        apiURL: process.env.BENCHMARK_COSMIC_API_URL,
        bucketSlug: process.env.BENCHMARK_COSMIC_BUCKET,
        objectTypes: [`posts`],
        apiAccess: {
          read_key: process.env.BENCHMARK_COSMIC_READ_KEY,
        },
        localMedia: true,
      },
    },
  ],
}
