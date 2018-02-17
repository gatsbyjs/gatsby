/* @flow */
const webpack = require(`webpack`)
const fs = require(`fs`)
const debug = require(`debug`)(`gatsby:html`)

const webpackConfig = require(`../utils/webpack.config`)
const { store } = require(`../redux`)
const { createErrorFromString } = require(`gatsby-cli/lib/reporter/errors`)

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
    webpack(compilerConfig).run((e, stats) => {
      if (e) {
        return reject(e)
      }
      const outputFile = `${directory}/public/main.render-page.js`
      if (stats.hasErrors()) {
        let webpackErrors = stats.toJson().errors.filter(Boolean)
        return reject(
          webpackErrors.length
            ? createErrorFromString(webpackErrors[0], `${outputFile}.map`)
            : new Error(
                `There was an issue while building the site: ` +
                  `\n\n${stats.toString()}`
              )
        )
      }

      // Remove the temp JS bundle file built for the static-site-generator-plugin
      try {
        fs.unlinkSync(outputFile)
        fs.unlinkSync(`${outputFile}.map`)
      } catch (e) {
        // This function will fail on Windows with no further consequences.
      }
      return resolve(null, stats)
    })
  })
}
