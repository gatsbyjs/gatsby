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
  // Don't cache-bust JS or CSS files, and anything in the static directory,
  // since these files have unique URLs and their contents will never change
  dontCacheBustUrlsMatching: /(\.js$|\.css$|static\/)/,
  runtimeCaching: [
    {
      // Use cacheFirst since these don't need to be revalidated (same RegExp
      // and same reason as above)
      urlPattern: /(\.js$|\.css$|static\/)/,
      handler: `cacheFirst`,
    },
    {
      // Add runtime caching of various other page resources
      urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
      handler: `staleWhileRevalidate`,
    },
    {
      // Google Fonts CSS (doesn't end in .css so we need to specify it)
      urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
      handler: `staleWhileRevalidate`,
    },
  ],
  skipWaiting: true,
  clientsClaim: true,
}
```

## Remove

If you want to remove `gatsby-plugin-offline` from your site at a later point,
substitute it with [`gatsby-plugin-remove-serviceworker`](https://www.npmjs.com/package/gatsby-plugin-remove-serviceworker)
to safely remove the service worker:

```diff:title=gatsby-config.js
 plugins: [
-  `gatsby-plugin-offline`,
+  `gatsby-plugin-remove-serviceworker`,
 ]
```

This will ensure that the worker is properly unregistered, instead of leaving an
outdated version registered in users' browsers.
