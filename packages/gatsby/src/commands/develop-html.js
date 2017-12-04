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
    webpack(compilerConfig).run((e, stats) => {
      if (e) {
        return reject(e)
      }
      const outputFile = `${directory}/public/render-page.js`
      if (stats.hasErrors()) {
        let webpackErrors = stats.toJson().errors
        console.log(`here`, webpackErrors[0])
        return reject(
          createErrorFromString(webpackErrors[0], `${outputFile}.map`)
        )
      }

      // Remove the temp JS bundle file built for the static-site-generator-plugin
      try {
        fs.unlinkSync(outputFile)
      } catch (e) {
        // This function will fail on Windows with no further consequences.
      }

      return resolve(null, stats)
    })
  })
}
