# gatsby-plugin-facebook-analytics

Easily add Facebook Analytics to your Gatsby site.

You must have a [Facebook App](https://developers.facebook.com/apps) ID to use this plugin.

This loads the Facebook JavaScript SDK which means that [Social Plugins](https://developers.facebook.com/docs/plugins/) can also be used. If you're not using social plugins, setting `xfbml` to `false` will improve page load times.

## Install

`npm install gatsby-plugin-facebook-analytics`

## How to use

The `appId` option is required. All other options are optional. Default values are shown in the example below:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-facebook-analytics`,
    options: {
      // Required - set this to the ID of your Facebook app.
      appId: `YOUR_APP_ID`,

      // Which version of the SDK to load.
      version: `v3.3`,

      // Determines whether XFBML tags used by social plugins are parsed.
      xfbml: true,

      // Determines whether a cookie is created for the session or not.
      cookie: false,

      // Include Facebook analytics in development.
      // Defaults to false meaning the library will only be loaded in production.
      includeInDevelopment: false,

      // Include debug version of sdk
      // Defaults to false meaning the library will load sdk.js
      debug: false,

      // Select your language.
      language: `en_US`,
    },
  },
]
```

See the [Facebook JavaScript SDK initialization reference](https://developers.facebook.com/docs/javascript/reference/FB.init/) for further details of these options.
