'use strict'

import webpack from 'webpack'
import globPages from './glob-pages'
import webpackConfig from './webpack.config'
import getUserGatsbyConfig from './get-user-gatsby-config'

const debug = require('debug')('gatsby:static')

module.exports = function (program, callback) {
  const { directory } = program
  return globPages(directory, function (err, pages) {
    debug('generating static site')
    const routes = pages.filter(function (page) { return (page.path !== null) }).map(function (page) { return page.path })

    const compilerConfig = webpackConfig(program, directory, 'static', null, routes)
    const config = getUserGatsbyConfig(compilerConfig, 'static')

    return webpack(config.resolve()).run(function (error, stats) {
      if (error) {
        return callback(error, stats)
      }
      if (stats.hasErrors()) {
        return callback('Error: ' + stats.toJson().errors, stats)
      }
      return callback(null, stats)
    })
  })
}
