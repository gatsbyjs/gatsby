module.exports = {
  siteMetadata: {
    title: `File System Route API`,
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-transformer-yaml`,
      options: {
        // Conditionally set the typeName so that we both use a lowercased and capitalized type name
        typeName: ({ node }) => {
          const name = node.sourceInstanceName
          if (name === `products`) {
            return `Product`
          }
          if (name === `parks`) {
            return `park`
          }
          return name
        },
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/products`,
        name: `products`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/parks`,
        name: `parks`,
      },
    },
  ],
}
