require('node-cjsx').transform()
webpack = require 'webpack'
globPages = require './glob-pages'
webpackConfig = require './webpack.config'
getUserGatsbyConfig = require './get-user-gatsby-config'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  globPages directory, (err, pages) ->
    routes = pages.filter((page) -> page.path?).map((page) -> page.path)

    #### Static site generation.
    compilerConfig = webpackConfig(program, directory, 'static', null, routes)
    config = getUserGatsbyConfig(compilerConfig, 'static')

    webpack(config.resolve()).run (err, stats) ->
      if err
        return callback(err, stats)
      if stats.hasErrors()
        return callback('Error: ' + stats.toJson().errors, stats)
      callback(null, stats)
