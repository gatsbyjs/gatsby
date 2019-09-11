module.exports = {
  siteMetadata: {
    title: `An example to learn how to source data form Wordpress`,
    subtitle: `Sourcing data from Wordpress`,
  },
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        baseUrl: `example.wordpress.com`,
        protocol: `https`,
        hostingWPCOM: false,
        useACF: false,
      },
    },
  ],
}
