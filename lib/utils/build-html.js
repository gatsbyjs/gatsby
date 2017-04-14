/* @flow weak */
/* eslint import/imports-first: 0 */
require('node-cjsx').transform()
import webpack from 'webpack'
import fs from 'fs'
import globPages from './glob-pages'
import webpackConfig from './webpack.config'

const debug = require('debug')('gatsby:html')

module.exports = (program, callback) => {
  const { directory } = program

  globPages(directory, (err, pages) => {
    debug('generating static HTML')
    const routes = pages.filter(page => page.path).map(page => page.path)

    // Static site generation.
    const compilerConfig = webpackConfig(
      program,
      directory,
      'build-html',
      null,
      routes
    )

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
  })
}
