require('node-cjsx').transform()
webpack = require 'webpack'
globPages = require './glob-pages'
webpackConfig = require './webpack.config'
path = require 'path'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  globPages directory, (err, pages) ->
    routes = pages.filter((page) -> page.path?).map((page) -> page.path)

    #### Static site generation.
    compilerConfig = webpackConfig(program, directory, 'static', null, routes)
    config = require(path.resolve(process.cwd(), './gatsby.config.js'))(compilerConfig, 'static');

    webpack(config.resolve()).run (err, stats) ->
      if err
        return callback(err, stats)
      if stats.hasErrors()
        return callback('Error: ' + stats.toJson().errors, stats)
      callback(null, stats)
