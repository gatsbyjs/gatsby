module.exports = {
  siteMetadata: {
    title: `Gatsby Contentful e2e`,
  },
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        // This space is for testing purposes only.
        // Never store your Contentful credentials in your projects config file.
        // Use: https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/
        spaceId: `k8iqpp6u0ior`,
        accessToken: `hO_7N0bLaCJFbu5nL3QVekwNeB_TNtg6tOCB_9qzKUw`,
        enableTags: true,
        downloadLocal: true,
      },
    },
    `gatsby-transformer-remark`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-sqip`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          // We disable placeholders by default to simplify tests
          // and ensure that we respect these defaults
          placeholder: `none`,
        },
      },
    },
    // Enable to update schema.sql
    // {
    //   resolve: `gatsby-plugin-schema-snapshot`,
    //   options: {
    //     path: `schema.gql`,
    //     update: true,
    //   },
    // },
  ],
}
