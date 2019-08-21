const fs = require(`fs`)
const workboxBuild = require(`workbox-build`)
const path = require(`path`)
const slash = require(`slash`)
const glob = require(`glob`)
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

const getAssetsForChunks = chunks => {
  const files = _.flatten(
    chunks.map(chunk => readStats().assetsByChunkName[chunk])
  )
  return _.compact(files)
}

exports.onPostBuild = (
  args,
  { precachePages: precachePagesGlobs = [], appendScript = null, workboxConfig }
) => {
  const { pathPrefix } = args
  const rootDir = `public`

  // Get exact asset filenames for app and offline app shell chunks
  const files = getAssetsForChunks([
    `app`,
    `webpack-runtime`,
    `component---node-modules-gatsby-plugin-offline-app-shell-js`,
  ])
  const appFile = files.find(file => file.startsWith(`app-`))

  // Remove the custom prefix (if any) so Workbox can find the files.
  // This is added back at runtime (see modifyUrlPrefix) in order to serve
  // from the correct location.
  const omitPrefix = path => path.slice(pathPrefix.length)

  const precachePages = []
  precachePagesGlobs.forEach(page => {
    const matches = glob.sync(`${process.cwd()}/${rootDir}${page}`)
    matches.forEach(path => {
      const isDirectory = fs.lstatSync(path).isDirectory()
      let precachePath

      if (isDirectory) {
        precachePath = `${path}/index.html`
      } else if (path.endsWith(`.html`)) {
        precachePath = path
      } else {
        return
      }

      if (precachePages.indexOf(precachePath) === -1) {
        precachePages.push(precachePath)
      }
    })
  })

  console.log(`precachePages`, precachePages)

  const criticalFilePaths = _.uniq([
    ...getResourcesFromHTML(
      `${process.cwd()}/${rootDir}/offline-plugin-app-shell-fallback/index.html`
    ),
    ...(() => {
      console.log(
        `mapped to GRFH`,
        precachePages.map(page => getResourcesFromHTML(page))
      )
      return precachePages.map(page => getResourcesFromHTML(page)).flat()
    })(),
  ]).map(omitPrefix)

  console.log(`criticalFilePaths`, criticalFilePaths)

  const globPatterns = files.concat([
    `offline-plugin-app-shell-fallback/index.html`,
    ...criticalFilePaths,
  ])

  const manifests = [`manifest.json`, `manifest.webmanifest`]
  manifests.forEach(file => {
    if (fs.existsSync(`${rootDir}/${file}`)) globPatterns.push(file)
  })

  const options = {
    importWorkboxFrom: `local`,
    globDirectory: rootDir,
    globPatterns,
    modifyURLPrefix: {
      // If `pathPrefix` is configured by user, we should replace
      // the default prefix with `pathPrefix`.
      "/": `${pathPrefix}/`,
    },
    cacheId: `gatsby-plugin-offline`,
    // Don't cache-bust JS or CSS files, and anything in the static directory,
    // since these files have unique URLs and their contents will never change
    dontCacheBustURLsMatching: /(\.js$|\.css$|static\/)/,
    runtimeCaching: [
      {
        // Use cacheFirst since these don't need to be revalidated (same RegExp
        // and same reason as above)
        urlPattern: /(\.js$|\.css$|static\/)/,
        handler: `CacheFirst`,
      },
      {
        // page-data.json files are not content hashed
        urlPattern: /^https?:.*\page-data\/.*\/page-data\.json/,
        handler: `NetworkFirst`,
      },
      {
        // Add runtime caching of various other page resources
        urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
        handler: `StaleWhileRevalidate`,
      },
      {
        // Google Fonts CSS (doesn't end in .css so we need to specify it)
        urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
        handler: `StaleWhileRevalidate`,
      },
    ],
    skipWaiting: true,
    clientsClaim: true,
  }

  const combinedOptions = {
    ...options,
    ...workboxConfig,
  }

  const idbKeyvalFile = `idb-keyval-iife.min.js`
  const idbKeyvalSource = require.resolve(`idb-keyval/dist/${idbKeyvalFile}`)
  const idbKeyvalDest = `public/${idbKeyvalFile}`
  fs.createReadStream(idbKeyvalSource).pipe(fs.createWriteStream(idbKeyvalDest))

  const swDest = `public/sw.js`
  return workboxBuild
    .generateSW({ swDest, ...combinedOptions })
    .then(({ count, size, warnings }) => {
      if (warnings) warnings.forEach(warning => console.warn(warning))

      const swAppend = fs
        .readFileSync(`${__dirname}/sw-append.js`, `utf8`)
        .replace(/%pathPrefix%/g, pathPrefix)
        .replace(/%appFile%/g, appFile)

      fs.appendFileSync(`public/sw.js`, `\n` + swAppend)

      if (appendScript !== null) {
        let userAppend
        try {
          userAppend = fs.readFileSync(appendScript, `utf8`)
        } catch {
          throw new Error(`Couldn't find the specified offline inject script`)
        }
        fs.appendFileSync(`public/sw.js`, `\n` + userAppend)
      }

      console.log(
        `Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`
      )
    })
}
