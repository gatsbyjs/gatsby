module.exports = {
  siteMetadata: {
    title: `Gatsby CSV Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    `gatsby-transformer-csv`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blurp`,
        path: __dirname,
      },
    },
  ],
}
