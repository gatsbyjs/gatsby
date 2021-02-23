import WebpackAssetsManifest from "webpack-assets-manifest"

import makePluginData from "./plugin-data"
import buildHeadersProgram from "./build-headers-program"
import createRedirects from "./create-redirects"
import { isSibling } from "./is-sibling"
import { DEFAULT_OPTIONS, BUILD_HTML_STAGE, BUILD_CSS_STAGE } from "./constants"

let assetsManifest = {}

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

exports.onPostBuild = async (
  { store, pathPrefix, reporter },
  userPluginOptions
) => {
  const pluginData = makePluginData(store, assetsManifest, pathPrefix)
  const pluginOptions = { ...DEFAULT_OPTIONS, ...userPluginOptions }

  const { redirects } = store.getState()

  let rewrites = []
  let siblingStaticPaths = []
  if (pluginOptions.generateMatchPathRewrites) {
    const { pages } = store.getState()
    rewrites = Array.from(pages.values())
      .filter(page => page.matchPath && page.matchPath !== page.path)
      .map(page => {
        const siblings = Array.from(pages.values())
          .filter(maybeSiblingPage => {
            if (maybeSiblingPage.matchPath) return false

            return isSibling(page.matchPath, maybeSiblingPage.path)
          })
          .map(p => p.path)

        siblingStaticPaths.push(...siblings)

        return {
          fromPath: page.matchPath,
          toPath: page.path,
        }
      })
  }

  await Promise.all([
    buildHeadersProgram(pluginData, pluginOptions, reporter),
    createRedirects(pluginData, redirects, rewrites, siblingStaticPaths),
  ])
}

exports.pluginOptionsSchema = ({ Joi }) =>
  Joi.object({
    headers: Joi.object()
      .pattern(/^/, Joi.array().items(Joi.string()))
      .description(`Option to add headers for a filename`),
    allPageHeaders: Joi.array()
      .items(Joi.string())
      .description(`Option to add headers for all files`),
    mergeSecurityHeaders: Joi.boolean().description(
      `Option to include default Gatsby Cloud security headers (true by default)`
    ),
    mergeLinkHeaders: Joi.boolean().description(
      `Option to include default Gatsby Cloud link headers (true by default)`
    ),
    mergeCachingHeaders: Joi.boolean().description(
      `Option to include default Gatsby Cloud caching headers (true by default)`
    ),
    transformHeaders: Joi.function()
      .arity(2)
      .description(`Option to transform headers using a function`),
    generateMatchPathRewrites: Joi.boolean().description(
      `Option to include redirect rules for client only paths (set to true by default)`
    ),
  })
