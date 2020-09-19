module.exports = {
  siteMetadata: {
    title: `Gatsby CSV Markdown Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    `gatsby-transformer-csv`,
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: __dirname + '/gendata.csv',
      },
    },
  ],
}
