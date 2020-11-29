module.exports = {
  siteMetadata: {
    title: `Gatsby CSV Markdown Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blurp`,
        path: __dirname + '/gendata.csv',
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-transformer-csv`,
  ],
}
