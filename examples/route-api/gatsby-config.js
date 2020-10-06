module.exports = {
  siteMetadata: {
    title: `File System Route API`,
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-transformer-yaml`,
      options: {
        typeName: `Product`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/blog`,
        name: `blog`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/products`,
        name: `products`
      }
    },
  ],
}
