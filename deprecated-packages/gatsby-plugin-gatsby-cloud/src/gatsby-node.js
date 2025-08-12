import { readJSON } from "fs-extra"
import WebpackAssetsManifest from "webpack-assets-manifest"
import {
  generatePageDataPath,
  joinPath,
  generateHtmlPath,
} from "gatsby-core-utils"
import makePluginData from "./plugin-data"
import buildHeadersProgram from "./build-headers-program"
import copyFunctionsManifest from "./copy-functions-manifest"
import createRedirects from "./create-redirects"
import createSiteConfig from "./create-site-config"
import { DEFAULT_OPTIONS, BUILD_HTML_STAGE } from "./constants"
import { emitRoutes, emitFileNodes, emitTotalRenderedPageCount } from "./ipc"

const assetsManifest = {}

process.env.GATSBY_PREVIEW_INDICATOR_ENABLED =
  process.env.GATSBY_PREVIEW_INDICATOR_ENABLED || `false`

// Inject a webpack plugin to get the file manifests so we can translate all link headers
exports.onCreateWebpackConfig = ({ actions, stage }) => {
  if (stage === BUILD_HTML_STAGE) {
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

exports.onPostBuild = async ({ store }, userPluginOptions) => {
  const pluginOptions = { ...DEFAULT_OPTIONS, ...userPluginOptions }

  const { redirects, pages } = store.getState()

  const pluginData = makePluginData(store, assetsManifest)

  /**
   * Emit via IPC routes for which pages are non SSG
   */
  let index = 0
  let batch = {}
  for (const [pathname, page] of pages) {
    if (page.mode && page.mode !== `SSG`) {
      index++

      const fullPathName = page.matchPath ? page.matchPath : pathname
      batch[generateHtmlPath(``, fullPathName)] = page.mode
      batch[generatePageDataPath(``, fullPathName)] = page.mode

      if (index % 1000 === 0) {
        await emitRoutes(batch)
        batch = {}
      }
    }
  }
  if (Object.keys(batch).length > 0) {
    await emitRoutes(batch)
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
    ensureEmittingFileNodesFinished,
    buildHeadersProgram(pluginData, pluginOptions),
    createSiteConfig(pluginData, pluginOptions),
    createRedirects(pluginData, redirects, rewrites),
    copyFunctionsManifest(pluginData),
    emitTotalRenderedPageCount(pages.size),
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
    disablePreviewUI: Joi.boolean().description(
      `When set to true, turns off Gatsby Preview if enabled`
    ),
  })
}

exports.pluginOptionsSchema = pluginOptionsSchema

/**
 * We emit File Nodes via IPC and we need to make sure build doesn't finish before all of
 * messages were sent.
 */
let ensureEmittingFileNodesFinished
exports.onPreBootstrap = ({ emitter, getNodesByType }) => {
  emitter.on(`API_FINISHED`, action => {
    if (action.payload.apiName !== `sourceNodes`) {
      return
    }

    async function doEmitFileNodes() {
      const fileNodes = getNodesByType(`File`)

      // TODO: This is missing the cacheLocations .cache/caches + .cache/caches-lmdb
      for (const file of fileNodes) {
        await emitFileNodes({
          path: file.absolutePath,
        })
      }
    }

    ensureEmittingFileNodesFinished = doEmitFileNodes()
  })
}
