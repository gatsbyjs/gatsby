module.exports = {
  siteMetadata: {
    title: `Gatsby React Native Web plugin example`,
  },
  plugins: [
    `gatsby-plugin-react-next`,
    `gatsby-plugin-react-native-web`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
  ],
}
