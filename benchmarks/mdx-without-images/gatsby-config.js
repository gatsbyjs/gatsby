module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby MDX Benchmark`,
  },
  plugins: [
    // Skip the plugin if NBR is set
    ...process.env.NBR ? [] : [`gatsby-plugin-benchmark-reporting`],
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
