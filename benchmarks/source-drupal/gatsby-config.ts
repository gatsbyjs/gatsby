import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
// @ts-ignore
import dotenv from "dotenv"

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby Drupal Benchmark`,
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
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: process.env.BENCHMARK_DRUPAL_BASE_URL,
        // Auth needed for POST
      },
    },
  ],
}
