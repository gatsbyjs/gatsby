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
    },
  },
]
```
