# gatsby-plugin-google-tagmanager

Easily add Google Tagmanager to your Gatsby site.

## Install

`npm install --save gatsby-plugin-google-tagmanager`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: "gatsby-plugin-google-tagmanager",
    options: {
      id: "YOUR_GOOGLE_TAGMANAGER_ID",

      // Include GTM in development.
      // Defaults to false meaning GTM will only be loaded in production.
      includeInDevelopment: false,

      // datalayer to be set before GTM is loaded
      // should be an object or a function that is executed in the browser
      // Defaults to null
      defaultDataLayer: { platform: "gatsby" },

      // Specify optional GTM environment details.
      gtmAuth: "YOUR_GOOGLE_TAGMANAGER_ENVIROMENT_AUTH_STRING",
      gtmPreview: "YOUR_GOOGLE_TAGMANAGER_ENVIROMENT_PREVIEW_NAME",
      dataLayerName: "YOUR_DATA_LAYER_NAME",

      // Whether to put the GTM script into the <head> (as suggested by Google)
      // or append it to the <body> (making it non-blocking).
      // Defaults to false meaning GTM will be added in the <head> (again, as suggested by Google).
      addTagInBody: false,
    },
  },
]
```

If you like to use data at runtime for your defaultDataLayer you can do that by defining it as a function.

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: "gatsby-plugin-google-tagmanager",
    options: {
      // datalayer to be set before GTM is loaded
      // should be a stringified object or object
      // Defaults to null
      defaultDataLayer: function() {
        return {
          pageType: window.pageType,
        }
      },
    },
  },
]
```

#### Note

Out of the box this plugin will simply load Google Tag Manager on the initial page/app load. It's up to you to fire tags based on changes in your app. To automatically track page changes, in GA for instance, you can configure your tags in GTM to trigger on [History Change](https://support.google.com/tagmanager/answer/7679322?hl=en&ref_topic=7679108).
