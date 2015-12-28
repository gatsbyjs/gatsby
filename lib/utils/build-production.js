'use strict'

import webpack from 'webpack'
import webpackConfig from './webpack.config'
import getUserGatsbyConfig from './get-user-gatsby-config'

module.exports = function (program, callback) {
  const { directory } = program

  const compilerConfig = webpackConfig(program, directory, 'production')
  const config = getUserGatsbyConfig(compilerConfig, 'production')

  return webpack(config.resolve()).run(function (err, stats) {
    return callback(err, stats)
  })
}
