require("dotenv").config({
  path: `.env`,
})

module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby MD Benchmark`,
  },
  plugins: [
    `gatsby-plugin-benchmark-reporting`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "articles",
        path: `${__dirname}/src/articles/`,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
}
