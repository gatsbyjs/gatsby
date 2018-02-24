# gatsby-plugin-facebook-analitycs

Easily add Facebook Analitycs to your Gatsby site.

## Install

`npm install --save gatsby-plugin-facebook-analitycs`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-facebook-analitycs`,
    options: {
      appId: "YOUR_APP_ID",
      // Include facebook analitycs in development.
      // Defaults to false meaning will only be loaded in production.
      includeInDevelopment: false,
    },
  },
]
```
