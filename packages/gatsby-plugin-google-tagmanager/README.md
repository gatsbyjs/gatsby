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
      id: 'YOUR_GOOGLE_TAGMANAGER_ID',
      // want GTM to render on dev? (localhost:8000)
      // very common to have JS snippets specifically for dev env
      // defaults to false; change this boolean to true to render on dev env
      renderOnDev: false
    },
  },
]
```
