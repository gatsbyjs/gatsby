import WebpackAssetsManifest from "webpack-assets-manifest"
import { captureEvent } from "gatsby-telemetry"
import makePluginData from "./plugin-data"
import buildHeadersProgram from "./build-headers-program"
import copyFunctionsManifest from "./copy-functions-manifest"
import createRedirects from "./create-redirects"
import { readJSON } from "fs-extra"
import { joinPath } from "gatsby-core-utils"
import { DEFAULT_OPTIONS, BUILD_HTML_STAGE, BUILD_CSS_STAGE } from "./constants"

const assetsManifest = {}

process.env.GATSBY_PREVIEW_INDICATOR_ENABLED =
  process.env.GATSBY_PREVIEW_INDICATOR_ENABLED || `false`

// Inject a webpack plugin to get the file manifests so we can translate all link headers
exports.onCreateWebpackConfig = ({ actions, stage }) => {
  if (stage !== BUILD_HTML_STAGE && stage !== BUILD_CSS_STAGE) {
    return
  }

  actions.setWebpackConfig({
    plugins: [
      new WebpackAssetsManifest({
        assets: assetsManifest, // mutates object with entries
        merge: true,
      }),
    ],
  })
}

function emitRoutes(routes) {
  if (!process.send) {
    console.log(`No process send available`)
    return
  }

  process.send({
    type: `LOG_ACTION`,
    action: {
      type: `LOG_ROUTES`,
      payload: {
        routes,
      },
    },
  })
}

exports.onPostBuild = async ({ store, pathPrefix }, userPluginOptions) => {
  const pluginData = makePluginData(store, assetsManifest, pathPrefix)

  const pluginOptions = { ...DEFAULT_OPTIONS, ...userPluginOptions }

  const { redirects, pageDataStats, nodes, pages } = store.getState()

  for (const [pathname, page] of pages) {
    if (page.mode && page.mode !== `SSG`) {
      emitRoutes({
        [`${pathname.substring(1)}index.html`]: page.mode,
        [`page-data/${pathname.substring(1)}page-data.json`]: page.mode,
      })
    }
  }

  let nodesCount

  try {
    const { getDataStore } = require(`gatsby/dist/datastore`)
    nodesCount = getDataStore().countNodes()
  } catch (e) {
    // swallow exception
  }

  if (typeof nodesCount === `undefined`) {
    nodesCount = nodes && nodes.size
  }

  const pagesCount = pageDataStats && pageDataStats.size

  try {
    captureEvent(`GATSBY_CLOUD_METADATA`, {
      siteMeasurements: {
        pagesCount,
        nodesCount,
      },
    })
  } catch (e) {
    console.error(e)
  }

  let rewrites = []
  if (pluginOptions.generateMatchPathRewrites) {
    const matchPathsFile = joinPath(
      pluginData.program.directory,
      `.cache`,
      `match-paths.json`
    )

    const matchPaths = await readJSON(matchPathsFile)

    rewrites = matchPaths.map(({ matchPath, path }) => {
      return {
        fromPath: matchPath,
        toPath: path,
      }
    })
  }

  await Promise.all([
    buildHeadersProgram(pluginData, pluginOptions),
    createRedirects(pluginData, redirects, rewrites),
    copyFunctionsManifest(pluginData),
  ])
}

const MATCH_ALL_KEYS = /^/
const pluginOptionsSchema = function ({ Joi }) {
  const headersSchema = Joi.object()
    .pattern(MATCH_ALL_KEYS, Joi.array().items(Joi.string()))
    .description(`Add more headers to specific pages`)

  return Joi.object({
    headers: headersSchema,
    allPageHeaders: Joi.array()
      .items(Joi.string())
      .description(`Add more headers to all the pages`),
    mergeSecurityHeaders: Joi.boolean().description(
      `When set to false, turns off the default security headers`
    ),
    mergeLinkHeaders: Joi.boolean().description(
      `When set to false, turns off the default gatsby js headers`
    ),
    mergeCachingHeaders: Joi.boolean().description(
      `When set to false, turns off the default caching headers`
    ),
    transformHeaders: Joi.function()
      .maxArity(2)
      .description(
        `Transform function for manipulating headers under each path (e.g.sorting), etc. This should return an object of type: { key: Array<string> }`
      ),
    generateMatchPathRewrites: Joi.boolean().description(
      `When set to false, turns off automatic creation of redirect rules for client only paths`
    ),
  })
}

exports.pluginOptionsSchema = pluginOptionsSchema
