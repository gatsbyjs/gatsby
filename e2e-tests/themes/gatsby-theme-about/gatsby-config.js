module.exports = {
  siteMetadata: {
    title: `Blog Title Placeholder`,
    author: `Name Placeholder`,
    description: `Description placeholder`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `./content/posts`,
      },
    },
    `gatsby-plugin-mdx`,
  ],
}
