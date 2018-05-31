/* @flow */
const fs = require(`fs`)
const webpack = require(`webpack`)
const { createErrorFromString } = require(`gatsby-cli/lib/reporter/errors`)
const debug = require(`debug`)(`gatsby:html`)
const webpackConfig = require(`../utils/webpack.config`)

module.exports = async (program: any) => {
  const { directory } = program

  debug(`generating static HTML`)

  // Static site generation.
  const compilerConfig = await webpackConfig(
    program,
    directory,
    `develop-html`,
    null,
    [`/`]
  )

  return new Promise((resolve, reject) => {
    webpack(compilerConfig.resolve()).run((e, stats) => {
      if (e) {
        return reject(e)
      }
      const buildDirectory = process.env.GATSBY_BUILD_DIR || `public`
      const buildFile = `${directory}/${buildDirectory}/render-page.js`
      if (stats.hasErrors()) {
        let webpackErrors = stats.toJson().errors
        return reject(
          createErrorFromString(webpackErrors[0], `${buildFile}.map`)
        )
      }

      // Remove the temp JS bundle file built for the static-site-generator-plugin
      try {
        fs.unlinkSync(buildFile)
      } catch (e) {
        // This function will fail on Windows with no further consequences.
      }

      return resolve(null, stats)
    })
  })
}
