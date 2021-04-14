require("dotenv").config()

module.exports = {
  siteMetadata: {
    url: process.env.BENCHMARK_STRAPI_API_URL || "http://localhost:1337", // No trailing slash allowed!
  },
  plugins: [
    `gatsby-plugin-benchmark-reporting`,
    {
      resolve: "gatsby-source-strapi",
      options: {
        apiURL: process.env.BENCHMARK_STRAPI_API_URL || "http://localhost:1337",
        contentTypes: [
          "article",
        ],
        queryLimit: parseInt(process.env.BENCHMARK_STRAPI_DATASET),
      },
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
  ],
}
