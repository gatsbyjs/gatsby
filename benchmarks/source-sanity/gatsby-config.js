require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby Sanity Benchmark`,
  },
  plugins: [
    `gatsby-plugin-benchmark-reporting`,
    {
      resolve: `gatsby-source-sanity`,
      options: {
        projectId: process.env.BENCHMARK_SANITY_PROJECT_ID,
        dataset: process.env.BENCHMARK_SANITY_DATASET,
      },
    },
  ],
}
