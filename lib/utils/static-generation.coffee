require('node-cjsx').transform()
webpack = require 'webpack'
globPages = require './glob-pages'
webpackConfig = require './webpack.config'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  globPages directory, (err, pages) ->
    routes = pages.filter((page) -> page.path?).map((page) -> page.path)

    #### Static site generation.
    compilerConfig = webpackConfig(program, directory, 'static', null, routes)

    webpack(compilerConfig).run (err, stats) ->
      callback(err, stats)
