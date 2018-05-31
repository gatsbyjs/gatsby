# gatsby-plugin-vk-pixel

Easily add VK Pixel to your Gatsby site.

## Install

`npm install --save gatsby-plugin-vk-pixel`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-vk-pixel`,
    options: {
      id: 'pixel id here',

      // Include VK Pixel in development.
      // Defaults to false meaning VK Pixel will only be loaded in production.
      includeInDevelopment: false,
    },
  },
]
```
