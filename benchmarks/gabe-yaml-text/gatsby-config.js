module.exports = {
  siteMetadata: {
    title: `Gatsby FS YAML Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/gendata.yaml`,
      },
    },
  ],
}
