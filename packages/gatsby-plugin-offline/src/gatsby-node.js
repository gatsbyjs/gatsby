const fs = require(`fs`)
const precache = require(`sw-precache`)
const path = require(`path`)
const slash = require(`slash`)
const _ = require(`lodash`)

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

const getAssetsForChunks = (chunks, rootDir) => _.flatten(chunks.map(chunk => readStats().assetsByChunkName[chunk]))
    .filter(assetFileName => assetFileName.indexOf(`webpack-runtime-`) !== 0)
    .map(assetFileName => `${rootDir}/${assetFileName}`)

exports.onPostBuild = (args, pluginOptions) => {
  const rootDir = `public`

  // Get exact asset filenames for app and offline app shell chunks
  const files = getAssetsForChunks(
    [`app`, `component---node-modules-gatsby-plugin-offline-app-shell-js`],
    rootDir
  )

  const options = {
    staticFileGlobs: files.concat([
      `${rootDir}/index.html`,
      `${rootDir}/manifest.json`,
      `${rootDir}/manifest.webmanifest`,
      `${rootDir}/offline-plugin-app-shell-fallback/index.html`,
    ]),
    stripPrefix: rootDir,
    // If `pathPrefix` is configured by user, we should replace
    // the `public` prefix with `pathPrefix`.
    // See more at:
    // https://github.com/GoogleChrome/sw-precache#replaceprefix-string
    replacePrefix: args.pathPrefix || ``,
    navigateFallback: `/offline-plugin-app-shell-fallback/index.html`,
    // Only match URLs without extensions.
    // So example.com/about/ will pass but
    // example.com/cheeseburger.jpg will not.
    // We only want the service worker to handle our "clean"
    // URLs and not any files hosted on the site.
    //
    // Regex from http://stackoverflow.com/a/18017805
    navigateFallbackWhitelist: [/^.*([^.]{5}|.html)$/],
    cacheId: `gatsby-plugin-offline`,
    // Don't cache-bust JS files and anything in the static directory
    dontCacheBustUrlsMatching: /(.*js$|\/static\/)/,
    runtimeCaching: [
      {
        // Add runtime caching of images.
        urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2)$/,
        handler: `fastest`,
      },
    ],
    skipWaiting: true,
  }

  const combinedOptions = _.defaults(pluginOptions, options)

  return precache.write(`public/sw.js`, combinedOptions)
}
