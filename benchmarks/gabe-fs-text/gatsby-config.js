module.exports = {
  siteMetadata: {
    title: `Gatsby FS Text Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/generated_articles`,
      },
    },
  ],
}
