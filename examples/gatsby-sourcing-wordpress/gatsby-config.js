module.exports = {
  siteMetadata: {
    title: ``,
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
