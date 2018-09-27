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

The default config is as follows. Warning, you can break the offline support
and AppCache setup by changing these options so tread carefully.

```javascript
const options = {
  importWorkboxFrom: `local`,
  globDirectory: rootDir,
  globPatterns,
  modifyUrlPrefix: {
    rootDir: ``,
    // If `pathPrefix` is configured by user, we should replace
    // the default prefix with `pathPrefix`.
    "": args.pathPrefix || ``,
  },
  navigateFallback: `/offline-plugin-app-shell-fallback/index.html`,
  // Only match URLs without extensions or the query `no-cache=1`.
  // So example.com/about/ will pass but
  // example.com/about/?no-cache=1 and
  // example.com/cheeseburger.jpg will not.
  // We only want the service worker to handle our "clean"
  // URLs and not any files hosted on the site.
  //
  // Regex based on http://stackoverflow.com/a/18017805
  navigateFallbackWhitelist: [/^[^?]*([^.?]{5}|\.html)(\?.*)?$/],
  navigateFallbackBlacklist: [/\?(.+&)?no-cache=1$/],
  cacheId: `gatsby-plugin-offline`,
  // Don't cache-bust JS files and anything in the static directory
  dontCacheBustUrlsMatching: /(.*js$|\/static\/)/,
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
