module.exports = {
  siteMetadata: {
    title: `Gatsby CSV Text Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    `gatsby-transformer-csv`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blurp`,
        path: __dirname + '/gendata.csv',
      },
    },
  ],
}
