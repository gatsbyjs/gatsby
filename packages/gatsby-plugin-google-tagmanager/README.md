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
      gtmAuth: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_AUTH_STRING",
      gtmPreview: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_PREVIEW_NAME",
      dataLayerName: "YOUR_DATA_LAYER_NAME",
    },
  },
]
```

#### Tracking routes

This plugin will fire a new event called `gatsby-route-change` whenever a route is changed in your Gatsby application. To record this in Google Tag Manager, we will need to add a trigger to the desired tag to listen for the event:

1. Visit the [Google Tag Manager console](https://tagmanager.google.com/) and click on the workspace for your site.
2. Navigate to the desired tag using the 'Tags' tab of the menu on the right hand side.
3. Under "Triggering", click the pencil icon, then the "+" button to add a new trigger.
4. In the "Choose a trigger" window, click on the "+" button again.
5. Choose the trigger type by clicking the pencil button and clicking "Custom event". For event name, enter `gatsby-route-change`.

This tag will now catch every route change in Gatsby, and you can add Google tag services as you wish to it.

#### Note

Out of the box this plugin will simply load Google Tag Manager on the initial page/app load. It's up to you to fire tags based on changes in your app. See the above "Tracking routes" section for an example.
