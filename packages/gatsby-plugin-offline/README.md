# gatsby-plugin-offline

Adds drop-in support for making a Gatsby site work offline and more
resistant to bad network connections. It creates a service worker for
the site and loads the service worker into the client.

If you're using this plugin with `gatsby-plugin-manifest` (recommended)
this plugin should be listed *after* that plugin so the manifest file
can be included in the service worker.

## Install

`npm install --save gatsby-plugin-offline`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-plugin-offline`,
]
```
