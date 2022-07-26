require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby WordPress Build Benchmark`,
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
      resolve: `gatsby-source-wordpress`,
      options: {
        url: process.env.BENCHMARK_WPGRAPHQL_URL,
        type: {
          Post: {
            limit: process.env.NODE_ENV === `development` ? 50 : false,
          },
        },
      },
    },
  ],
}
