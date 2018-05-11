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
plugins: [`gatsby-plugin-offline`];
```

## Overriding options

When adding this plugin to your `gatsby-config.js`, you can pass in options to
override the default sw-precache config.

The default config is as following. Warning, you can break the offline support
and AppCache setup by changing these options so tread carefully.

```javascript
const options = {
  staticFileGlobs: [
    `${rootDir}/**/*.{woff2}`,
    `${rootDir}/commons-*js`,
    `${rootDir}/app-*js`,
    `${rootDir}/index.html`,
    `${rootDir}/manifest.json`,
    `${rootDir}/manifest.webmanifest`,
    `${rootDir}/offline-plugin-app-shell-fallback/index.html`,
  ],
  stripPrefix: rootDir,
  navigateFallback: `/offline-plugin-app-shell-fallback/index.html`,
  // Only match URLs without extensions.
  // So example.com/about/ will pass but
  // example.com/cheeseburger.jpg will not.
  // We only want the service worker to handle our "clean"
  // URLs and not any files hosted on the site.
  navigateFallbackWhitelist: [/^.*(?!\.\w?$)/],
  cacheId: `gatsby-plugin-offline`,
  // Do cache bust JS URLs until can figure out how to make Webpack's
  // URLs truely content-addressed.
  dontCacheBustUrlsMatching: /(.\w{8}.woff2)/, //|-\w{20}.js)/,
  runtimeCaching: [
    {
      // Add runtime caching of images.
      urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|tiff)$/,
      handler: `fastest`,
    },
  ],
  skipWaiting: false,
};
```
