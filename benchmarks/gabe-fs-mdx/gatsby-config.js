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
      options: {
        defaultLayouts: {
          articles: path.resolve(`./src/templates/blog-post.js`),
        },
      },
    },
    `gatsby-plugin-webpack-bundle-analyser-v2`,
  ],
}
