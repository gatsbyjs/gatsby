module.exports = {
  siteMetadata: {
    title: `Gatsby FS JSON Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/gendata.json`,
      },
    },
  ],
}
