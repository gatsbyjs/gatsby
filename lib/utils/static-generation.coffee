require('node-cjsx').transform()
webpack = require 'webpack'
StaticSiteGeneratorPlugin = require 'static-site-generator-webpack-plugin'
globPages = require './glob-pages'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  globPages directory, (err, pages) ->
    routes = pages.map (page) -> page.path

    compilerConfig = {
      entry: [
        "#{__dirname}/static-entry"
      ],
      output:
        path: directory + "/public"
        filename: "bundle.js"
        libraryTarget: 'umd'
      resolveLoader: {
        modulesDirectories: ["#{__dirname}/../../node_modules", "#{__dirname}/../loaders"]
      },
      plugins: [
        new StaticSiteGeneratorPlugin('bundle.js', routes)
      ],
      resolve: {
        extensions: ['', '.js', '.cjsx', '.coffee', '.json', '.toml', '.yaml']
        modulesDirectories: [directory, "#{__dirname}/../isomorphic", "#{directory}/node_modules", "node_modules"]
      },
      module: {
        loaders: [
          { test: /\.css$/, loaders: ['css']},
          { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
          { test: /\.coffee$/, loader: 'coffee' }
          { test: /\.toml$/, loader: 'config', query: {
            directory: directory
          } }
          { test: /\.md$/, loader: 'markdown' }
          { test: /\.html$/, loader: 'raw' }
          { test: /\.json$/, loaders: ['config', 'json'] }
          { test: /\.png$/, loader: 'null' }
          { test: /\.jpg$/, loader: 'null' }
          { test: /\.ico$/, loader: 'null' }
          { test: /\.pdf$/, loader: 'null' }
          { test: /\.txt$/, loader: 'null' }
        ]
      }
    }

    #### Static site generation.
    webpack(compilerConfig).run (err, stats) ->
      callback(err, stats)
