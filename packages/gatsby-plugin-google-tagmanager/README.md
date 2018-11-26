# gatsby-plugin-google-tagmanager

Easily add Google Tagmanager to your Gatsby site.

## Install

`npm install --save gatsby-plugin-google-tagmanager`

## How to use

```javascript
// In your gatsby-config.js
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
    },
  },
]
```

#### Note

Out of the box this plugin will simply load Google Tag Manager on the initial page/app load. It's up to you to fire tags based on changes in your app. To automatically track page changes, in GA for instance, you can configure your tags in GTM to trigger on [History Change](https://support.google.com/tagmanager/topic/7679384?hl=en&rd=1#HistoryChange).
