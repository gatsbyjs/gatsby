// https://www.netlify.com/docs/headers-and-basic-auth/

import WebpackAssetsManifest from "webpack-assets-manifest"

import makePluginData from "./plugin-data"
import buildHeadersProgram from "./build-headers-program"
import createRedirects from "./create-redirects"
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
  const NOT_FOUND_REGEXP = /\/404\/?$/
  const localizedNotFound = []
  let rewrites = []
  if (pluginOptions.generateMatchPathRewrites) {
    const { pages } = store.getState()
    Array.from(pages.values())
      .filter(page => page.matchPath && page.matchPath !== page.path)
      .forEach(page => {
        const isNotFoundPage = NOT_FOUND_REGEXP.test(page.path)
        if (isNotFoundPage) {
          localizedNotFound.push({
            fromPath: page.matchPath,
            status: 404,
            toPath: page.path,
          })
        } else {
          rewrites.push({
            fromPath: page.matchPath,
            toPath: page.path,
            status: 200,
          })
        }
      })
  }
  await Promise.all([
    buildHeadersProgram(pluginData, pluginOptions, reporter),
    createRedirects(pluginData, redirects, rewrites.concat(localizedNotFound)),
  ])
}
