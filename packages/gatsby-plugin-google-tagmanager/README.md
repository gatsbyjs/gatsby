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
      // This value defaults to false but if you change it to true, 
      // your GTM snippet will render in your development env.
      includeInDevelopment: false
    },
  },
]
```
