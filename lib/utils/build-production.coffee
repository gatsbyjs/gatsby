webpack = require 'webpack'
webpackConfig = require './webpack.config'
getUserGatsbyConfig = require './get-user-gatsby-config'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  #### Build production js.
  compilerConfig = webpackConfig(program, directory, 'production')
  config = getUserGatsbyConfig(compilerConfig, 'production')

  webpack(config.resolve()).run (err, stats) ->
    callback err, stats

