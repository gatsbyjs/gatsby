require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby Flotiq Benchmark`,
  },
  plugins: [
    `gatsby-plugin-benchmark-reporting`,
    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-source-flotiq",
      options: {
        baseUrl: "https://api.flotiq.com",
        authToken: process.env.BENCHMARK_FLOTIQ_API_TOKEN,
        forceReload: false,
      },
    },
  ],
}
