webpack = require 'webpack'
webpackConfig = require './webpack.config'
path = require 'path'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  #### Build production js.
  compilerConfig = webpackConfig(program, directory, 'production')
  config = require(path.resolve(process.cwd(), './gatsby.config.js'))(compilerConfig, 'production');
  webpack(config.resolve()).run (err, stats) ->
    callback err, stats

