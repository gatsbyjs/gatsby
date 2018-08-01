module.exports = {
  siteMetadata: {
    title: `gatsby-example-using-plugin-google-tagmanager`,
    description: `Blazing-fast React.js static site generator`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: "YOUR_GOOGLE_TAGMANAGER_ID",

        // Include GTM in development.
        // Defaults to false meaning GTM will only be loaded in production.
        includeInDevelopment: false,

        // Specify optional GTM environment details.
        gtmAuth: "YOUR_GOOGLE_TAGMANAGER_ENVIROMENT_AUTH_STRING",
        gtmPreview: "YOUR_GOOGLE_TAGMANAGER_ENVIROMENT_PREVIEW_NAME",

        // Specify if you want GTM to be loaded in the <head> tag
        // or at the end of the <body> tag
        includePostBody: false //default false (optional)
      },
    },
  ],
}
