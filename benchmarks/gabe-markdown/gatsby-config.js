module.exports = {
  siteMetadata: {
    title: `Gatsby Markdown Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/generated_articles`,
        name: `blog`,
      },
    },
    `gatsby-transformer-remark`,
  ],
}
