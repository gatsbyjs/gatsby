/* @flow weak */
require('node-cjsx').transform()
import webpack from 'webpack'
import webpackConfig from './webpack.config'
import fs from 'fs'
const debug = require('debug')('gatsby:html')
import { routesDB } from './globals'

module.exports = (program, callback) => {
  const { directory } = program

  debug('generating static HTML')
  const routes = routesDB.data.filter((page) => page.path).map((page) => page.path)

  // Static site generation.
  const compilerConfig = webpackConfig(program, directory, 'build-html', null, routes)

  webpack(compilerConfig.resolve()).run((e, stats) => {
    if (e) {
      return callback(e, stats)
    }
    if (stats.hasErrors()) {
      return callback(`Error: ${stats.toJson().errors}`, stats)
    }

    // A temp file required by static-site-generator-plugin
    fs.unlinkSync(`${directory}/public/render-page.js`)

    return callback(null, stats)
  })
}
