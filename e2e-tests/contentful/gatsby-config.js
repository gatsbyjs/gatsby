const path = require(`path`)

module.exports = {
  siteMetadata: {
    title: `Gatsby Contentful e2e`,
  },
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `k8iqpp6u0ior`,
        accessToken: `hO_7N0bLaCJFbu5nL3QVekwNeB_TNtg6tOCB_9qzKUw`,
      },
    },
    `gatsby-transformer-sqip`,
    `gatsby-plugin-image`,
  ],
}
