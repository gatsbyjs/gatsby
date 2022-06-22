const path = require("path")

module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby MDX Benchmark`,
  },
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "articles",
        path: `${__dirname}/generated_articles/`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
    },
    !process.env.CI && `gatsby-plugin-webpack-bundle-analyser-v2`,
  ].filter(Boolean),
}
