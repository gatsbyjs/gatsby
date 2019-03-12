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
const readStats = cache => {
  if (s) {
    return s
  } else {
    s = JSON.parse(
      fs.readFileSync(cache.publicPath(`webpack.stats.json`), `utf-8`)
    )
    return s
  }
}

const getAssetsForChunks = (cache, chunks) => {
  const files = _.flatten(
    chunks.map(chunk => readStats(cache).assetsByChunkName[chunk])
  )
  return _.compact(files)
}

exports.onPostBuild = (args, pluginOptions) => {
  const { pathPrefix, cache } = args

  // Get exact asset filenames for app and offline app shell chunks
  const files = getAssetsForChunks(cache, [
    `app`,
    `webpack-runtime`,
    `component---node-modules-gatsby-plugin-offline-app-shell-js`,
  ])

  // Remove the custom prefix (if any) so Workbox can find the files.
  // This is added back at runtime (see modifyUrlPrefix) in order to serve
  // from the correct location.
  const omitPrefix = path => path.slice(pathPrefix.length)

  const criticalFilePaths = _.uniq(
    _.concat(
      getResourcesFromHTML(cache.publicPath(`404.html`)),
      getResourcesFromHTML(
        cache.publicPath(`offline-plugin-app-shell-fallback/index.html`)
      )
    )
  ).map(omitPrefix)

  const globPatterns = files.concat([
    `offline-plugin-app-shell-fallback/index.html`,
    ...criticalFilePaths,
  ])

  const manifests = [`manifest.json`, `manifest.webmanifest`]
  manifests.forEach(file => {
    if (fs.existsSync(cache.publicPath(file))) globPatterns.push(file)
  })

  const options = {
    importWorkboxFrom: `local`,
    globDirectory: cache.publicPath(),
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

  // pluginOptions.plugins is assigned automatically when the user hasn't
  // specified custom options - Workbox throws an error with unsupported
  // parameters, so delete it.
  delete pluginOptions.plugins
  const combinedOptions = _.defaults(pluginOptions, options)

  const idbKeyvalFile = `idb-keyval-iife.min.js`
  const idbKeyvalSource = require.resolve(`idb-keyval/dist/${idbKeyvalFile}`)
  const idbKeyvalDest = cache.publicPath(idbKeyvalFile)
  fs.createReadStream(idbKeyvalSource).pipe(fs.createWriteStream(idbKeyvalDest))

  const swDest = cache.publicPath(`sw.js`)
  return workboxBuild
    .generateSW({ swDest, ...combinedOptions })
    .then(({ count, size, warnings }) => {
      if (warnings) warnings.forEach(warning => console.warn(warning))

      const swAppend = fs
        .readFileSync(`${__dirname}/sw-append.js`, `utf8`)
        .replace(/%pathPrefix%/g, pathPrefix)

      fs.appendFileSync(swDest, `\n` + swAppend)
      console.log(
        `Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`
      )
    })
}
