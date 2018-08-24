const fs = require(`fs`)
const workboxBuild = require(`workbox-build`)
const path = require(`path`)
const slash = require(`slash`)
const _ = require(`lodash`)

const getResourcesFromHTML = require(`./get-resources-from-html`)

exports.createPages = ({ actions }) => {
  if (process.env.NODE_ENV === `production`) {
    const { createPage } = actions
    createPage({
      path: `/offline-plugin-app-shell-fallback/`,
      component: slash(path.resolve(`${__dirname}/app-shell.js`)),
    })
  }
}

let s
const readStats = () => {
  if (s) {
    return s
  } else {
    s = JSON.parse(
      fs.readFileSync(`${process.cwd()}/public/webpack.stats.json`, `utf-8`)
    )
    return s
  }
}

const getAssetsForChunks = (chunks, rootDir) =>
  _.flatten(chunks.map(chunk => readStats().assetsByChunkName[chunk])).map(
    assetFileName => `${rootDir}/${assetFileName}`
  )

exports.onPostBuild = (args, pluginOptions) => {
  const rootDir = `public`

  // Get exact asset filenames for app and offline app shell chunks
  const files = getAssetsForChunks(
    [
      `app`,
      `webpack-runtime`,
      `component---node-modules-gatsby-plugin-offline-app-shell-js`,
    ],
    rootDir
  )

  const criticalFilePaths = _.uniq(
    _.concat(
      getResourcesFromHTML(`${process.cwd()}/${rootDir}/index.html`),
      getResourcesFromHTML(`${process.cwd()}/${rootDir}/404.html`),
      getResourcesFromHTML(
        `${process.cwd()}/${rootDir}/offline-plugin-app-shell-fallback/index.html`
      )
    )
  )

  const options = {
    globPatterns: files.concat([
      `${rootDir}/index.html`,
      `${rootDir}/manifest.json`,
      `${rootDir}/manifest.webmanifest`,
      `${rootDir}/offline-plugin-app-shell-fallback/index.html`,
      ...criticalFilePaths,
    ]),
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
  }

  const combinedOptions = _.defaults(pluginOptions, options)
  return workboxBuild.write({ swDest: `public/sw.js`, ...combinedOptions })
}
