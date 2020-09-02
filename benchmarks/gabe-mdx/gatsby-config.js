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
    `gatsby-plugin-mdx`,
  ],
}
