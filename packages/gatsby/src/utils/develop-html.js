/* @flow */
import webpack from 'webpack'
import Promise from 'bluebird'
import fs from 'fs'
import webpackConfig from './webpack.config'

const debug = require(`debug`)(`gatsby:html`)

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
      if (stats.hasErrors()) {
        return reject(`Error: ${stats.toJson().errors}`, stats)
      }

      // Remove the temp JS bundle file built for the static-site-generator-plugin
      fs.unlinkSync(`${directory}/public/render-page.js`)

      return resolve(null, stats)
    })
  })
}
