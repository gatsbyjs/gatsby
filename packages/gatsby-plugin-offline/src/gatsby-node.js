const fs = require(`fs`)
const precache = require(`sw-precache`)
const path = require(`path`)
const slash = require(`slash`)
const _ = require(`lodash`)
const replace = require(`replace-in-file`)

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
    staticFileGlobs: files.concat([
      `${rootDir}/index.html`,
      `${rootDir}/manifest.json`,
      `${rootDir}/manifest.webmanifest`,
      `${rootDir}/offline-plugin-app-shell-fallback/index.html`,
      ...criticalFilePaths,
    ]),
    stripPrefix: rootDir,
    // If `pathPrefix` is configured by user, we should replace
    // the `public` prefix with `pathPrefix`.
    // See more at:
    // https://github.com/GoogleChrome/sw-precache#replaceprefix-string
    replacePrefix: args.pathPrefix || ``,
    navigateFallback: `/offline-plugin-app-shell-fallback/index.html`,
    // Only match URLs without extensions or the query `no-cache=1`.
    // So example.com/about/ will pass but
    // example.com/about/?no-cache=1 and
    // example.com/cheeseburger.jpg will not.
    // We only want the service worker to handle our "clean"
    // URLs and not any files hosted on the site.
    //
    // Regex based on http://stackoverflow.com/a/18017805
    navigateFallbackWhitelist: [/^.*([^.]{5}|.html)(?<!(\?|&)no-cache=1)$/],
    cacheId: `gatsby-plugin-offline`,
    // Don't cache-bust JS files and anything in the static directory
    dontCacheBustUrlsMatching: /(.*js$|\/static\/)/,
    runtimeCaching: [
      {
        // Add runtime caching of various page resources.
        urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
        handler: `fastest`,
      },
    ],
    skipWaiting: true,
  }

  const combinedOptions = _.defaults(pluginOptions, options)

  return precache.write(`public/sw.js`, combinedOptions).then(() =>
    // Patch sw.js to include search queries when matching URLs against navigateFallbackWhitelist
    replace({
      files: `public/sw.js`,
      from: `path = (new URL(absoluteUrlString)).pathname`,
      to: `url = new URL(absoluteUrlString), path = url.pathname + url.search`,
    }).then(changes => {
      // Check that the patch has been applied correctly
      if (changes.length !== 1)
        throw new Error(
          `Patching sw.js failed - sw-precache has probably been modified upstream.\n` +
            `Please report this issue at https://github.com/gatsbyjs/gatsby/issues`
        )
    })
  )
}
