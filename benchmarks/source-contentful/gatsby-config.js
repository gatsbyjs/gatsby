require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const contentfulConfig = {
  spaceId: process.env.BENCHMARK_CONTENTFUL_SPACE_ID,
  accessToken: process.env.BENCHMARK_CONTENTFUL_ACCESS_TOKEN,
  host: process.env.BENCHMARK_CONTENTFUL_HOST,
}

const { spaceId, accessToken } = contentfulConfig

if (!spaceId || !accessToken) {
  throw new Error(
    "Contentful spaceId and the access token need to be provided."
  )
}

module.exports = {
  siteMetadata: {
    siteTitle: "Gatsby Contentful Benchmark",
  },
  plugins: [
    `gatsby-plugin-benchmark-reporting`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: "gatsby-source-contentful",
      options: contentfulConfig,
      pageLimit: 1000,
    },
  ],
}
