module.exports = {
  siteMetadata: {
    title: `An example to learn how to source data form Wordpress`,
    subtitle: `Sourcing data from Wordpress`,
  },
  plugins: [
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        /*
         * The base URL of the Wordpress site without the trailingslash and the protocol. This is required.
         * Example : 'dev-gatbsyjswp.pantheonsite.io' or 'www.example-site.com'
         */
        baseUrl: `example.wordpress.com`,
        protocol: `https`,
        hostingWPCOM: false,
        useACF: false,
      },
    },
  ],
}
