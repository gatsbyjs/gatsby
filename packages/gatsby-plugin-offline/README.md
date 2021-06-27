# gatsby-plugin-offline

Adds drop-in support for making a Gatsby site work offline and more resistant to
bad network connections. It uses [Workbox Build](https://developers.google.com/web/tools/workbox/modules/workbox-build)
to create a service worker for the site and loads the service worker into the client.

If you're using this plugin with `gatsby-plugin-manifest` (recommended) this
plugin should be listed _after_ that plugin so the manifest file can be included
in the service worker.

## Install

`npm install gatsby-plugin-offline`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-offline`]
```

## Available options

In `gatsby-plugin-offline` 5.x, the following options are available:

- `precachePages` lets you specify pages whose resources should be precached by the service worker, using an array of globs. For example:

  ```javascript:title=gatsby-config.js
  plugins: [
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [`/about-us/`, `/projects/*`],
      },
    },
  ]
  ```

  Note: while essential resources of specified pages will be precached, such as JavaScript and CSS, non-essential resources such as fonts and images will not be included. Instead, these will be cached at runtime when a user visits a given page that includes these resources.

- `swSrc` lets you specify a file that is used as the entry point of the service worker (`sw.js`). For example:

  ```javascript:title=gatsby-config.js
  plugins: [
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        swSrc: require.resolve(`src/custom-sw-code.js`),
      },
    },
  ]
  ```

  <br />

  ```javascript:title=src/custom-sw-code.js
  // default workbox setup & logic from `gatsby-plugin-offline/serviceworker/index.js`:
  import { precache } from "gatsby-plugin-offline/serviceworker/precache.js"
  import { setup } from "gatsby-plugin-offline/serviceworker/setup.js"
  import { registerDefaultRoutes } from "gatsby-plugin-offline/serviceworker/default-routes.js"
  import { setupOfflineRouting } from "gatsby-plugin-offline/serviceworker/offline.js"
  import { googleAnalytics } from "gatsby-plugin-offline/serviceworker/google-analytics.js"
  import { cleanup } from "gatsby-plugin-offline/serviceworker/cleanup.js"
  import { NavigationRoute, registerRoute } from "workbox-routing"

  precache()
  setup()
  registerDefaultRoutes()
  setupOfflineRouting()
  googleAnalytics()
  cleanup()

  // custom code:

  // show a notification after 15 seconds (the notification
  // permission must be granted first)
  setTimeout(() => {
    self.registration.showNotification("Hello, world!")
  }, 15000)

  // register a custom navigation route
  const customRoute = new NavigationRoute(({ event }) => {
    // ...
  })
  registerRoute(customRoute)
  ```

  The specified file will be compiled/bundled with webpack, so as shown in the example above, other modules can be imported.

  Note: if you provide the `swSrc` option, you'll need to make sure that the appropriate workbox routes get set up
  and also the custom offline logic this plugin provides gets executed. See files in `gatsby-plugin-offline/serviceworker` for further information

- `cacheId` lets you specify a custom cache prefix used by workbox. See [Configure Workbox Documentation](https://developers.google.com/web/tools/workbox/guides/configure-workbox)

- `chunks` additional webpack chunk names that shall be precached. See [InjectManifest](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest) for more information

- `offlineAnalyticsConfig` If specified, these options get passed to the [workbox-google-analytics](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-google-analytics) plugin. You can also set this option to just enable this plugin with the default options

- `deletePreviousCacheVersionsOnUpdate` If set to true, automatically attempts to delete previous caches on service worker update if `cacheId` has changed. Useful if you're `chacheId` might change, and you want to avoid old, unused caches form taking up space on the user's device.

- `cleanupOutdatedCaches` If set to true, automatically cleans up outdated caches from older workbox versions. See [workbox's documentation](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-precaching?hl=en#.cleanupOutdatedCaches)

- `additionalManifestEntries`, `manifestTransforms`, `maximumFileSizeToCacheInBytes`, `dontCacheBustURLsMatching`, `modifyURLPrefix` Options passed to [workbox's InjectManifest webpack plugin](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.InjectManifest)

## Upgrading to 5.x

Version 5.x of this plugin no longer uses the `workbox-build`/`generateSW` tool to generate the service worker.
Instead, it uses the `InjectManifest` webpack plugin.
This means that some options are no longer supported (although it should be possible to implement the same features via a custom `swSrc` -> see above).

To upgrade from a version prior to 5.x (3.x, 4.x), you'll need to perform the following steps:

1. Remove no longer supported options `importWorkboxFrom` and `globDirectory`

2. Move supported options from `workboxConfig` to the root level option object

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-offline`,
    options: {
      precachePages: ["about"],
      workboxConfig: {
        cacheId: "some-cache-id",
        offlineGoogleAnalytics: true,
        cleanupOutdatedCaches: true,
        directoryIndex: "index.html",
        importWorkboxFrom: "cdn",
      },
    },
  },
]
```

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-offline`,
    options: {
      precachePages: ["about"],
      cacheId: "some-cache-id",
      offlineGoogleAnalytics: true,
      cleanupOutdatedCaches: true,
      directoryIndex: "index.html",
    },
  },
]
```

3. The `runtimeCaching` option is no longer supported in 5.x.
   If you previously used custom `runtimeCaching` handlers, you'll need to create a custom `swSrc` file to archive the same effect.

   <br />

   In case you just added some additional handlers without modifying the default handlers provided by `gatsby-plugin-offline`,
   this should be straight forward:

```javascript:title=old-gatsby-config.js
// previous
plugins: [
  {
    resolve: `gatsby-plugin-offline`,
    options: {
      workboxConfig: {
        runtimeCaching: [
          // Default handlers from gatsby-plugin-offline
          {
            // Use cacheFirst since these don't need to be revalidated (same RegExp
            // and same reason as above)
            urlPattern: /(\.js$|\.css$|static\/)/,
            handler: `CacheFirst`,
          },
          {
            // page-data.json files, static query results and app-data.json
            // are not content hashed
            urlPattern: /^https?:.*\/page-data\/.*\.json/,
            handler: `StaleWhileRevalidate`,
          },
          {
            // Add runtime caching of various other page resources
            urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|avif|svg|gif|tiff|js|woff|woff2|json|css)$/,
            handler: `StaleWhileRevalidate`,
          },
          {
            // Google Fonts CSS (doesn't end in .css so we need to specify it)
            urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
            handler: `StaleWhileRevalidate`,
          },

          // Your custom handler
          {
            urlPattern: /my-custom-pattern/,
            handler: `NetworkFirst`,
          },
        ],
      },
    },
  },
]
```

```javascript:title=new-gatsby-config.js
// 5.x
plugins: [
  {
    resolve: `gatsby-plugin-offline`,
    options: {
      // ...
      swSrc: path.resolve(__dirname, "src/custom-sw.js"),
    },
  },
]
```

```javascript:title=src/custom-sw.js
// this includes the default behaviour & setup of the service worker from gatsby-plugin-offline
import "gatsby-plugin-offline/serviceworker/index.js"

import { registerRoute } from "workbox-routing"
import { NetworkFirst } from "workbox-strategies"

// your custom handler goes here
registerRoute(/my-custom-pattern/, new NetworkFirst(), `GET`)
```

  <br />

If you have previously overwritten or modified the default handlers from `gatsby-plugin-offline`, you'll need a bit more code in your `swSrc`:

  <br />

```javascript:title=old-gatsby-config.js
// previous
plugins: [
  {
    resolve: `gatsby-plugin-offline`,
    options: {
      workboxConfig: {
        runtimeCaching: [
          // Default handlers from gatsby-plugin-offline
          {
            // *modified*
            // Use cacheFirst since these don't need to be revalidated (same RegExp
            // and same reason as above)
            urlPattern: /(\.js$|\.css$|static\/|\.wasm$)/,
            handler: `StaleWhileRevalidate`,
          },
          {
            // *not modified*
            // page-data.json files, static query results and app-data.json
            // are not content hashed
            urlPattern: /^https?:.*\/page-data\/.*\.json/,
            handler: `StaleWhileRevalidate`,
          },
        ],
      },
    },
  },
]
```

```javascript:title=new-gatsby-config.js
// 5.x
plugins: [
  {
    resolve: `gatsby-plugin-offline`,
    options: {
      // ...
      swSrc: path.resolve(__dirname, "src/custom-sw.js"),
    },
  },
]
```

```javascript:title=src/custom-sw.js
// code based on gatsby-plugin-offline/serviceworker/index.js (note: `registerDefaultRoutes()` is not used, as we will define all used route handlers below ourselfs)
import { precache } from "gatsby-plugin-offline/serviceworker/precache.js"
import { setup } from "gatsby-plugin-offline/serviceworker/setup.js"
import { setupOfflineRouting } from "gatsby-plugin-offline/serviceworker/offline.js"
import { googleAnalytics } from "gatsby-plugin-offline/serviceworker/google-analytics.js"
import { cleanup } from "gatsby-plugin-offline/serviceworker/cleanup.js"
import { NavigationRoute, registerRoute } from "workbox-routing"
import { registerRoute } from "workbox-routing"
import { StaleWhileRevalidate } from "workbox-strategies"

precache()
setup()
setupOfflineRouting()
googleAnalytics()
cleanup()

// your custom/modified handlers go here. Note: you'll need to specify all handlers manually, even those you didn't modify previously
registerRoute(
  /(\.js$|\.css$|static\/|\.wasm$)/,
  new StaleWhileRevalidate(),
  `GET`
) // modified handler
registerRoute(
  /^https?:.*\/page-data\/.*\.json/,
  new StaleWhileRevalidate(),
  `GET`
) // unmodified default handler
```

## Remove

If you want to remove `gatsby-plugin-offline` from your site at a later point,
substitute it with [`gatsby-plugin-remove-serviceworker`](https://www.npmjs.com/package/gatsby-plugin-remove-serviceworker)
to safely remove the service worker. First, install the new package:

```shell
npm install gatsby-plugin-remove-serviceworker
npm uninstall gatsby-plugin-offline
```

Then, update your `gatsby-config.js`:

```diff:title=gatsby-config.js
 plugins: [
-  `gatsby-plugin-offline`,
+  `gatsby-plugin-remove-serviceworker`,
 ]
```

This will ensure that the worker is properly unregistered, instead of leaving an
outdated version registered in users' browsers.

## Notes

### Empty View Source and SEO

Gatsby offers great SEO capabilities and that is no different with `gatsby-plugin-offline`. However, you shouldn't think that Gatsby doesn't serve HTML tags anymore when looking at your source code in the browser (with `Right click` => `View source`). `View source` doesn't represent the actual HTML data since `gatsby-plugin-offline` registers and loads a service worker that will cache and handle this differently. Your site is loaded from the service worker, not from its actual source (check your `Network` tab in the DevTools for that).

To see the HTML data that crawlers will receive, run this in your terminal:

**on Windows (using powershell):**

```shell
Invoke-WebRequest https://www.yourdomain.tld | Select -ExpandProperty Content
```

**on Mac OS/Linux:**

```shell
curl https://www.yourdomain.tld
```

Alternatively you can have a look at the `/public/index.html` file in your project folder.

### App shell and server logs

Server logs (like from [Netlify analytics](https://www.netlify.com/products/analytics/)) may show a large number of pageviews to a route like `/offline-plugin-app-shell-fallback/index.html`, this is a result of `gatsby-plugin-offline` adding an [app shell](https://developers.google.com/web/fundamentals/architecture/app-shell) to the page. The app shell is a minimal amount of user interface that can be cached offline for reliable performance loading on repeat visits. The shell can be loaded from the cache, and the content of the site loaded into the shell by the service worker.

### Using with gatsby-plugin-manifest

If using this plugin with `gatsby-plugin-manifest` you may find that your icons are not cached.
In order to solve this, update your `gatsby-config.js` as follows:

```js
// gatsby-config.js
{
   resolve: 'gatsby-plugin-manifest',
   options: {
      icon: 'icon.svg',
      cache_busting_mode: 'none'
   }
},
{
   resolve: 'gatsby-plugin-offline',
   options: {
      workboxConfig: {
         globPatterns: ['**/icon-path*']
      }
   }
}
```

Updating `cache_busting_mode` is necessary. Otherwise, workbox will break while attempting to find the cached URLs.
Adding the `globPatterns` makes sure that the offline plugin will cache everything.
Note that you have to prefix your icon with `icon-path` or whatever you may call it
