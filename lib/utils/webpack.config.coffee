webpack = require 'webpack'
StaticSiteGeneratorPlugin = require 'static-site-generator-webpack-plugin'

module.exports = (program, directory, stage, webpackPort = 1500, routes=[]) ->
  output = ->
    switch stage
      when "watch"
        path: directory
        filename: 'bundle.js'
        publicPath: "http://#{program.host}:#{webpackPort}/"
      when "production"
        filename: "bundle.js"
        path: directory + "/public"
      when "static"
        path: directory + "/public"
        filename: "bundle.js"
        libraryTarget: 'umd'

  entry = ->
    switch stage
      when "watch"
        [
          "#{__dirname}/../../node_modules/webpack-dev-server/client?#{program.host}:#{webpackPort}",
          "#{__dirname}/../../node_modules/webpack/hot/only-dev-server",
          "#{__dirname}/web-entry"
        ]
      when "production"
        [
          "#{__dirname}/web-entry"
        ]
      when "static"
        [
          "#{__dirname}/static-entry"
        ]

  plugins = ->
    switch stage
      when "watch"
        [
          new webpack.HotModuleReplacementPlugin(),
        ]
      when "production"
        [
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify("production")
            }
          })
          new webpack.optimize.DedupePlugin()
          new webpack.optimize.UglifyJsPlugin()
        ]
      when "static"
        [
          new StaticSiteGeneratorPlugin('bundle.js', routes)
        ]

  resolve = ->
    {
      extensions: ['', '.js', '.jsx', '.cjsx', '.coffee', '.json', '.less', '.toml', '.yaml']
      modulesDirectories: [directory, "#{__dirname}/../isomorphic", "#{directory}/node_modules", "node_modules"]
    }

  module = ->
    switch stage
      when "watch"
        loaders: [
          { test: /\.css$/, loaders: ['style', 'css']},
          { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
          { test: /\.jsx/, loaders: ['react-hot', 'babel']},
          { test: /\.less/, loaders: ['style', 'css', 'less']},
          { test: /\.coffee$/, loader: 'coffee' }
          { test: /\.md$/, loader: 'markdown' }
          { test: /\.html$/, loader: 'raw' }
          { test: /\.json$/, loaders: ['json'] }
          { test: /^((?!config).)*\.toml$/, loaders: ['toml'] } # Match everything except config.toml
          { test: /\.png$/, loader: 'null' }
          { test: /\.jpg$/, loader: 'null' }
          { test: /\.ico$/, loader: 'null' }
          { test: /\.pdf$/, loader: 'null' }
          { test: /\.txt$/, loader: 'null' }
          { test: /config\.[toml|yaml|json]/, loader: 'config', query: {
            directory: directory
          } }
        ]
      when "static"
        loaders: [
          { test: /\.css$/, loaders: ['css']},
          { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
          { test: /\.jsx/, loaders: ['babel']},
          { test: /\.less/, loaders: ['css', 'less']},
          { test: /\.coffee$/, loader: 'coffee' }
          { test: /\.md$/, loader: 'markdown' }
          { test: /\.html$/, loader: 'raw' }
          { test: /\.json$/, loaders: ['json'] }
          { test: /^((?!config).)*\.toml$/, loaders: ['toml'] } # Match everything except config.toml
          { test: /\.png$/, loader: 'null' }
          { test: /\.jpg$/, loader: 'null' }
          { test: /\.ico$/, loader: 'null' }
          { test: /\.pdf$/, loader: 'null' }
          { test: /\.txt$/, loader: 'null' }
          { test: /config\.[toml|yaml|json]/, loader: 'config', query: {
            directory: directory
          } }
        ]
      when "production"
        loaders: [
          { test: /\.css$/, loaders: ['style', 'css']},
          { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
          { test: /\.jsx/, loaders: ['babel']},
          { test: /\.less/, loaders: ['style', 'css', 'less']},
          { test: /\.coffee$/, loader: 'coffee' }
          { test: /\.md$/, loader: 'markdown' }
          { test: /\.html$/, loader: 'raw' }
          { test: /\.json$/, loaders: ['json'] }
          { test: /^((?!config).)*\.toml$/, loaders: ['toml'] } # Match everything except config.toml
          { test: /\.png$/, loader: 'null' }
          { test: /\.jpg$/, loader: 'null' }
          { test: /\.ico$/, loader: 'null' }
          { test: /\.pdf$/, loader: 'null' }
          { test: /\.txt$/, loader: 'null' }
          { test: /config\.[toml|yaml|json]/, loader: 'config', query: {
            directory: directory
          } }
        ]
  return {
    entry: entry()
    debug: true
    output: output()
    resolveLoader: {
      modulesDirectories: ["#{__dirname}/../../node_modules", "#{__dirname}/../loaders"]
    },
    plugins: plugins()
    resolve: resolve()
    module: module()
  }
