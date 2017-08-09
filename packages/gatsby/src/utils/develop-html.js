/* @flow */
import webpack from "webpack"
import Promise from "bluebird"
import fs from "fs"
import webpackConfig from "./webpack.config"

const debug = require(`debug`)(`gatsby:html`)

function createRealError(err: string) {
  let split = err.split(/\r\n|[\n\r]/g)
  let error = new Error(split[0].split(`:`).slice(1).join(`:`))
  error.stack = split.join(`\n`)
  error.name = `WebpackError`
  return error
}

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
      if (stats.hasErrors()) {
        let webpackErrors = stats.toJson().errors
        return reject(createRealError(webpackErrors[0]))
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

module.exports.createRealError = createRealError
