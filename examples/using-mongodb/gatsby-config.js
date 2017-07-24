module.exports = {
  siteMetadata: {
    title: `Gatsby with MongoDB`,
  },
  plugins: [
    {
      resolve: `gatsby-source-mongodb`,
      options: { dbName: `cloud`, collection: `documents` },
    },
    `gatsby-plugin-react-helmet`,
  ],
}
