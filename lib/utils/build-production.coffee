webpack = require 'webpack'
webpackConfig = require './webpack.config'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  #### Build production js.
  compilerConfig = webpackConfig(program, directory, 'production')
  webpack(compilerConfig).run (err, stats) ->
    callback err, stats

