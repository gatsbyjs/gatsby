program = require 'commander'
WebpackDevServer = require 'webpack-dev-server'
webpack = require 'webpack'
path = require 'path'
StaticSiteGeneratorPlugin = require 'static-site-generator-webpack-plugin'
globPages = require './lib/utils/glob-pages'

program
  .option('-h, --host <url>', 'set host. defaults to 0.0.0.0', "0.0.0.0")
  .parse(process.argv)

relativeDirectory = program.args[0]
directory = path.resolve(relativeDirectory)

compilerConfig = {
  entry: [
    "./web-entry"
  ],
  output:
    filename: "bundle.js"
    path: directory + "/public"
  resolveLoader: {
    modulesDirectories: ['node_modules', 'lib/loaders']
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    })
    new webpack.optimize.DedupePlugin()
    new webpack.optimize.UglifyJsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.cjsx', '.coffee', '.json', '.toml', '.yaml']
    modulesDirectories: [relativeDirectory, 'lib/isomorphic', 'node_modules']
  },
  module: {
    loaders: [
      { test: /\.css$/, loaders: ['style', 'css']},
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

console.log compilerConfig

#### Build production js.
webpack(compilerConfig).run (err, stats) ->
  console.log 'done'
  console.log err
  #console.log err, stats

