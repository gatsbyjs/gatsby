/* @flow */
const webpack = require(`webpack`)
const fs = require(`fs`)
const webpackConfig = require(`../utils/webpack.config`)
const { store } = require(`../redux`)
const { createErrorFromString } = require(`gatsby-cli/lib/reporter/errors`)

const debug = require(`debug`)(`gatsby:html`)

module.exports = async (program: any) => {
  const { directory } = program

  debug(`generating static HTML`)
  // Reduce pages objects to an array of paths.
  const pages = store.getState().pages.map(page => page.path)

  // Static site generation.
  const compilerConfig = await webpackConfig(
    program,
    directory,
    `build-html`,
    null,
    pages
  )

  return new Promise((resolve, reject) => {
    webpack(compilerConfig.resolve()).run((e, stats) => {
      if (e) {
        return reject(e)
      }
      if (stats.hasErrors()) {
        let webpackErrors = stats.toJson().errors
        return reject(createErrorFromString(webpackErrors[0]))
      }

      // Remove the temp JS bundle file built for the static-site-generator-plugin
      try {
        fs.unlinkSync(`${directory}/public/render-page.js`)
      } catch (e) {
        // This function will fail on Windows with no further consequences.
      }
      return resolve(null, stats)
    })
  })
}
