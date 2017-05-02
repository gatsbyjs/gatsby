module.exports = {
  siteMetadata: {
    title: `Gatsby with Drupal`,
  },
  // TODO this mapping should automatically be created by
  // the source plugin. Once Gatsby core has support for this,
  // remove this mapping.
  mapping: {
    "drupal__node__article.author": `drupal__user__user`,
  },
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: { baseUrl: `http://dev-gatsbyjs-d8.pantheonsite.io` },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
  ],
}
