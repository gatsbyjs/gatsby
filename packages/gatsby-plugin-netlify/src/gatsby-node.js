// https://www.netlify.com/docs/headers-and-basic-auth/

import WebpackAssetsManifest from "webpack-assets-manifest"

import makePluginData from "./plugin-data"
import buildHeadersProgram from "./build-headers-program"
import createRedirects from "./create-redirects"
import { DEFAULT_OPTIONS, BUILD_HTML_STAGE, BUILD_CSS_STAGE } from "./constants"

let assetsManifest = {}

// Inject a webpack plugin to get the file manifests so we can translate all link headers
exports.modifyWebpackConfig = ({ actions, stage }) => {
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

exports.onPostBuild = async ({ store, pathPrefix }, userPluginOptions) => {
  const pluginData = makePluginData(store, assetsManifest, pathPrefix)
  const pluginOptions = { ...DEFAULT_OPTIONS, ...userPluginOptions }

  const { redirects } = store.getState()

  await Promise.all([
    buildHeadersProgram(pluginData, pluginOptions),
    createRedirects(pluginData, redirects),
  ])
}
