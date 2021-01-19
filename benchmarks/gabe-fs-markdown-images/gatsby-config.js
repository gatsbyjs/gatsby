module.exports = {
  siteMetadata: {
    title: `Gatsby FS Markdown Benchmark for Gabe`,
    description: "A blog like no other blog",
    author: "Bob the Blogger",
  },
  plugins: [
    `gatsby-transformer-remark`,
    'gatsby-plugin-image',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/generated_articles`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `img`,
        path: `${__dirname}/generated_images`,
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
  ],
}
