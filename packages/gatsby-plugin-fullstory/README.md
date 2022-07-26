# gatsby-plugin-fullstory

Fullstory is an analytics service for recording customer visits. This plugin adds the tracking code.

## Install

`npm install gatsby-plugin-fullstory`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-fullstory`,
      options: {
        fs_org: YOUR_ORG_ID,
      },
    },
  ],
}
```
