module.exports = {
  siteMetadata: {
    siteName: `Using TypeScript Example`,
    exampleUrl: `https://github.com/gatsbyjs/gatsby/tree/master/examples/using-typescript`,
  },
  plugins: [
    // `gatsby-plugin-typescript` is automatically included in gatsby
    // You only need to explicitly define it here if you need to configure
    // specific options in it
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
        omitGoogleFont: true,
      },
    },
  ],
}
