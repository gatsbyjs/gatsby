# gatsby-plugin-facebook-analytics

Easily add Facebook Analytics to your Gatsby site.

## Install

`npm install --save gatsby-plugin-facebook-analytics`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-facebook-analytics`,
    options: {
      appId: "YOUR_APP_ID",
      // Include facebook analytics in development.
      // Defaults to false meaning the library will only be loaded in production.
      includeInDevelopment: false,
      // Include debug version of sdk
      // Defaults to false meaning the library will load sdk.js
      debug: false,
      // Can select your language, default will load english
      language: "en_US",
    },
  },
]
```
