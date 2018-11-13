# gatsby-plugin-offline

Adds drop-in support for making a Gatsby site work offline and more resistant to
bad network connections. It creates a service worker for the site and loads the
service worker into the client.

If you're using this plugin with `gatsby-plugin-manifest` (recommended) this
plugin should be listed _after_ that plugin so the manifest file can be included
in the service worker.

## Install

`npm install --save gatsby-plugin-offline`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-offline`]
```

## Overriding options

When adding this plugin to your `gatsby-config.js`, you can pass in options to
override the default [Workbox](https://developers.google.com/web/tools/workbox/modules/workbox-build) config.

The default config is as follows. Warning: you can break the offline support by
changing these options, so tread carefully.

```javascript
const options = {
  importWorkboxFrom: `local`,
  globDirectory: rootDir,
  globPatterns,
  modifyUrlPrefix: {
    // If `pathPrefix` is configured by user, we should replace
    // the default prefix with `pathPrefix`.
    "/": `${pathPrefix}/`,
  },
  cacheId: `gatsby-plugin-offline`,
  // Don't cache-bust JS or CSS files, and anything in the static directory
  dontCacheBustUrlsMatching: /(.*\.js$|.*\.css$|\/static\/)/,
  runtimeCaching: [
    {
      // Add runtime caching of various page resources.
      urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
      handler: `staleWhileRevalidate`,
    },
  ],
  skipWaiting: true,
  clientsClaim: true,
}
```
