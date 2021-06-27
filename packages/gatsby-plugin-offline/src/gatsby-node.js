// use `let` to workaround https://github.com/jhnns/rewire/issues/144
/* eslint-disable prefer-const */
let fs = require(`fs`)
const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const glob = require(`glob`)
const _ = require(`lodash`)
const md5File = require(`md5-file`)
let webpack = require(`webpack`)
let { InjectManifest } = require(`workbox-webpack-plugin`)

let getResourcesFromHTML = require(`./get-resources-from-html`)

const SW_DESTINATION_NAME = `sw.js`

exports.onPreBootstrap = ({ cache }) => {
  const appShellSourcePath = path.join(__dirname, `app-shell.js`)
  const appShellTargetPath = path.join(cache.directory, `app-shell.js`)
  fs.copyFileSync(appShellSourcePath, appShellTargetPath)
}

exports.onCreateWebpackConfig = (
  { stage, actions, getConfig, pathPrefix },
  options
) => {
  if (stage !== `build-javascript`) {
    return
  }

  const webpackConfig = getConfig()

  const swSrc = options.swSrc
    ? options.swSrc
    : path.join(__dirname, `serviceworker/index.js`)
  const dontCacheBustURLsMatching = options.dontCacheBustURLsMatching
    ? options.dontCacheBustURLsMatching
    : /(\.js$|\.css$|static\/)/
  const modifyURLPrefix = options.modifyURLPrefix
    ? options.modifyURLPrefix
    : {
        // If `pathPrefix` is configured by user, we should replace
        // the default prefix with `pathPrefix`.
        "/": `${pathPrefix}/`,
      }

  const defaultChunks = [`app`, `webpack-runtime`]
  const chunks = options.chunks
    ? [...defaultChunks, ...options.chunks]
    : defaultChunks

  const settings = {
    cacheId: options.cacheId ? options.cacheId : `gatsby-plugin-offline`,
    directoryIndex: `index.html`,
    skipWaiting: !_.isNil(options.skipWaiting) ? options.skipWaiting : true,
    deletePreviousCacheVersionsOnUpdate: !_.isNil(
      options.deletePreviousCacheVersionsOnUpdate
    )
      ? options.deletePreviousCacheVersionsOnUpdate
      : false,
    clientsClaim: !_.isNil(options.clientsClaim) ? options.clientsClaim : true,
    cleanupOutdatedCaches: !_.isNil(options.cleanupOutdatedCaches)
      ? options.cleanupOutdatedCaches
      : true,
    offlineAnalyticsConfigString: !_.isNil(options.offlineAnalyticsConfig)
      ? options.offlineAnalyticsConfig === true
        ? `{}`
        : JSON.stringify(options.offlineAnalyticsConfig)
      : false,
  }

  webpackConfig.plugins.push(
    new InjectManifest({
      compileSrc: true,
      swSrc,
      swDest: SW_DESTINATION_NAME,
      dontCacheBustURLsMatching,
      modifyURLPrefix,
      maximumFileSizeToCacheInBytes: options.maximumFileSizeToCacheInBytes,
      manifestTransforms: options.manifestTransforms,
      additionalManifestEntries: options.additionalManifestEntries,
      chunks,
      webpackCompilationPlugins: [
        new webpack.DefinePlugin({
          __GATSBY_PLUGIN_OFFLINE_SETTINGS: JSON.stringify(settings),
        }),
      ],
    })
  )

  actions.replaceWebpackConfig(webpackConfig)
}

exports.createPages = ({ actions, cache }) => {
  const appShellPath = path.join(cache.directory, `app-shell.js`)
  if (process.env.NODE_ENV === `production`) {
    const { createPage } = actions
    createPage({
      path: `/offline-plugin-app-shell-fallback/`,
      component: slash(appShellPath),
    })
  }
}

let s
const readStats = () => {
  if (s) {
    return s
  } else {
    s = JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), `public/webpack.stats.json`),
        `utf-8`
      )
    )
    return s
  }
}

function getAssetsForChunks(chunks) {
  const files = _.flatMap(chunks, chunk => readStats().assetsByChunkName[chunk])
  return _.compact(files)
}

function getPrecachePages(globs, base) {
  const precachePages = []

  globs.forEach(page => {
    const matches = glob.sync(base + page)
    matches.forEach(path => {
      const isDirectory = fs.lstatSync(path).isDirectory()
      let precachePath

      if (isDirectory && fs.existsSync(`${path}/index.html`)) {
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

  return precachePages
}

exports.onPostBuild = async (
  args,
  {
    precachePages: precachePagesGlobs = [],
    globPatterns: userGlobPatterns = [],
  }
) => {
  const { pathPrefix, reporter, createContentDigest } = args
  const rootDir = `public`
  const publicDir = path.resolve(process.cwd(), rootDir)
  const files = getAssetsForChunks([
    `component---cache-caches-gatsby-plugin-offline-app-shell-js`,
  ])
  const appFile = getAssetsForChunks([`app`]).find(file =>
    file.startsWith(`app-`)
  )

  const offlineShellPath = path.resolve(
    publicDir,
    `offline-plugin-app-shell-fallback/index.html`
  )

  const precachePages = [
    offlineShellPath,
    ...getPrecachePages(precachePagesGlobs, publicDir).filter(
      page => page !== offlineShellPath
    ),
  ]

  const criticalFilePaths = _.uniq(
    _.flatMap(precachePages, page => getResourcesFromHTML(page, pathPrefix))
  )

  const globPatterns = files.concat([
    // criticalFilePaths doesn't include HTML pages (we only need this one)
    `offline-plugin-app-shell-fallback/index.html`,
    ...criticalFilePaths,
    ...userGlobPatterns,
  ])

  const manifests = [`manifest.json`, `manifest.webmanifest`]
  manifests.forEach(file => {
    if (fs.existsSync(path.resolve(rootDir, file))) {
      globPatterns.push(file)
    }
  })

  const globedFiles = _.uniq(
    _.flatten(
      await Promise.all(
        globPatterns.map(
          pattern =>
            new Promise((resolve, reject) => {
              glob(
                pattern,
                {
                  cwd: publicDir,
                },
                (er, files) => {
                  if (er) {
                    reject(er)
                  }

                  try {
                    resolve(_.compact(files))
                  } catch (e) {
                    reject(e)
                  }
                }
              )
            })
        )
      )
    )
  )

  const precacheResources = await Promise.all(
    globedFiles.map(async file => {
      const revision = await md5File(path.resolve(publicDir, file))
      return { url: `/${_.trimStart(slash(file), `/`)}`, revision }
    })
  )

  const digest = createContentDigest(precacheResources).substr(0, 15)

  const resourcePrecacheManifest = `offline-precache-page-resource-manifest-${digest}.js`
  const precachePageResourceManifestPath = path.resolve(
    publicDir,
    resourcePrecacheManifest
  )

  fs.writeFileSync(
    precachePageResourceManifestPath,
    `self.__GATSBY_PLUGIN_OFFLINE_PRECACHE_PAGE_RESOURCES = ${JSON.stringify(
      precacheResources
    )}`
  )

  const swPublicPath = `public/${SW_DESTINATION_NAME}`
  const swText = fs
    .readFileSync(swPublicPath, `utf8`)
    .replace(
      /%precachePageResourcesManifestPath%/,
      `/${resourcePrecacheManifest}`
    )
    .replace(/%pathPrefix%/g, pathPrefix)
    .replace(/%appFile%/g, appFile)
  fs.writeFileSync(swPublicPath, swText)

  reporter.info(
    `Generated public/${SW_DESTINATION_NAME}.\n` +
      `The following pages will be precached:\n` +
      precachePages
        .map(path => path.replace(`${process.cwd()}/public`, ``))
        .join(`\n`)
  )
}

const MATCH_ALL_KEYS = /^/
exports.pluginOptionsSchema = function ({ Joi }) {
  // These are the options of the v5: https://www.gatsbyjs.com/plugins/gatsby-plugin-offline/#available-options
  return Joi.object({
    precachePages: Joi.array()
      .items(Joi.string())
      .description(
        `An array of pages whose resources should be precached by the service worker, using an array of globs`
      ),
    swSrc: Joi.string().description(
      `A file (path) to override the default entry point of the service worker. Will be compiled/bundled with webpack`
    ),
    globPatterns: Joi.array().items(Joi.string()),
    modifyURLPrefix: Joi.object().pattern(MATCH_ALL_KEYS, Joi.string()),
    cacheId: Joi.string(),
    dontCacheBustURLsMatching: Joi.object().instance(RegExp),
    maximumFileSizeToCacheInBytes: Joi.number(),
    skipWaiting: Joi.boolean(),
    clientsClaim: Joi.boolean(),
    manifestTransforms: Joi.array()
      .items(Joi.function())
      .description(
        `One or more functions which will be applied sequentially against the generated manifest. If modifyURLPrefix or dontCacheBustURLsMatching are also specified, their corresponding transformations will be applied first. See documentation https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.ManifestTransform`
      ),
    additionalManifestEntries: Joi.array()
      .items(
        Joi.object({
          url: Joi.string(),
          revision: Joi.string(),
          integrity: Joi.string(),
        })
      )
      .description(
        `A list of entries to be precached, in addition to any entries that are generated as part of the build configuration. See documentation https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.ManifestEntry`
      ),
    chunks: Joi.array()
      .items(Joi.string())
      .description(
        `An array of additional webpack chunks that should be precached. The app and webpack-runtime chunks are always precached.`
      ),
    cleanupOutdatedCaches: Joi.boolean().description(
      `Flag indicationg if incompatible cached versions from previous workbox versions should be cleaned up.`
    ),
    deletePreviousCacheVersionsOnUpdate: Joi.boolean().description(
      `If set to true, automatically deletes previous caches on service worker update if the cacheId has changed.`
    ),
    offlineAnalyticsConfig: Joi.alternatives()
      .try(
        Joi.boolean(),
        Joi.object({
          cacheName: Joi.string,
          parameterOverrides: Joi.object(),
          hitFilter: Joi.object().instance(Function),
        })
      )
      .description(
        `Configuration for offline google analytics feature. See also https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-google-analytics. If not set, this feature is disabled by default`
      ),
  })
}
