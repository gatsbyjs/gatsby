/* @flow weak */
require(`node-cjsx`).transform()
import webpack from 'webpack'
import webpackConfig from './webpack.config'
import fs from 'fs'
const debug = require(`debug`)(`gatsby:html`)
import { pagesDB } from './globals'

module.exports = (program, callback) => {
  const { directory } = program

  debug(`generating static HTML`)
  // Reduce pages objects to an array of paths.
  const pages = [...pagesDB().values()].map((page) => page.path)

  // Static site generation.
  const compilerConfig = webpackConfig(program, directory, `build-html`, null, pages)

  webpack(compilerConfig.resolve()).run((e, stats) => {
    if (e) {
      return callback(e, stats)
    }
    if (stats.hasErrors()) {
      return callback(`Error: ${stats.toJson().errors}`, stats)
    }

    // Remove the temp JS bundle file built for the static-site-generator-plugin
    //fs.unlinkSync(`${directory}/public/render-page.js`)

    return callback(null, stats)
  })
}
