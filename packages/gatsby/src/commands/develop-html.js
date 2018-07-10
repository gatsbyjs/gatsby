/* @flow */
const fs = require(`fs`)
const webpack = require(`webpack`)
const { createErrorFromString } = require(`gatsby-cli/lib/reporter/errors`)
const report = require(`gatsby-cli/lib/reporter`)
const debug = require(`debug`)(`gatsby:html`)
const webpackConfig = require(`../utils/webpack.config`)
const renderHTML = require(`../utils/html-renderer`)

module.exports = async (program: any) => {
  const { directory } = program

  debug(`generating static HTML`)

  // Static site generation.
  const compilerConfig = await webpackConfig(
    program,
    directory,
    `develop-html`,
    null
  )

  return new Promise((resolve, reject) => {
    webpack(compilerConfig).run((e, stats) => {
      if (e) {
        return reject(e)
      }
      const outputFile = `${directory}/public/render-page.js`
      if (stats.hasErrors()) {
        let webpackErrors = stats.toJson().errors
        return reject(
          createErrorFromString(webpackErrors[0], `${outputFile}.map`)
        )
      }

      let output = ``
      try {
        output = fs.readFileSync(`${outputFile}`, `utf-8`)
      } catch (err) {
        report.panic(`Failed to read ${outputFile}`, err)
      }
      fs.writeFileSync(outputFile, `exports=null;${output}`, `utf-8`)

      return renderHTML(require(outputFile), [`/`]).then(() => {
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
  })
}
