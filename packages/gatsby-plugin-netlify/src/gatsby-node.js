// https://www.netlify.com/docs/headers-and-basic-auth/

import WebpackAssetsManifest from "webpack-assets-manifest"
import MiniCssExtractPlugin from "mini-css-extract-plugin"

import makePluginData from "./plugin-data"
import buildHeadersProgram from "./build-headers-program"
import createRedirects from "./create-redirects"
import {
  DEFAULT_OPTIONS,
  BUILD_HTML_STAGE,
  BUILD_CSS_STAGE,
  BUILD_JS_STAGE,
} from "./constants"

let assetsManifest = {}

// Inject a webpack plugin to get the file manifests so we can translate all link headers
exports.onCreateWebpackConfig = ({ actions, stage, getConfig }) => {
  if (stage === BUILD_HTML_STAGE || stage === BUILD_CSS_STAGE) {
    actions.setWebpackConfig({
      plugins: [
        new WebpackAssetsManifest({
          assets: assetsManifest, // mutates object with entries
          merge: true,
        }),
      ],
    })
  }

  if (stage === BUILD_JS_STAGE) {
    const config = getConfig()
    const cssExtractIndex = config.plugins.findIndex(
      pl => pl instanceof MiniCssExtractPlugin
    )

    config.plugins[cssExtractIndex] = new MiniCssExtractPlugin({
      filename: `[name].css`,
      chunkFilename: `[name].css`,
    })

    config.output = {
      filename: `[name].js`,
      chunkFilename: `[name].js`,
      path: config.output.path,
      publicPath: config.output.publicPath,
    }
  }
}

exports.onPostBuild = async (
  { store, pathPrefix, reporter },
  userPluginOptions
) => {
  const pluginData = makePluginData(store, assetsManifest, pathPrefix)
  const pluginOptions = { ...DEFAULT_OPTIONS, ...userPluginOptions }

  const { redirects } = store.getState()

  let rewrites = []
  if (pluginOptions.generateMatchPathRewrites) {
    const { pages } = store.getState()
    rewrites = Array.from(pages.values())
      .filter(page => page.matchPath && page.matchPath !== page.path)
      .map(page => {
        return {
          fromPath: page.matchPath,
          toPath: page.path,
        }
      })
  }

  await Promise.all([
    buildHeadersProgram(pluginData, pluginOptions, reporter),
    createRedirects(pluginData, redirects, rewrites),
  ])
}
