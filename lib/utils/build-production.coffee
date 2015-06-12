webpack = require 'webpack'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  compilerConfig = {
    entry: [
      "#{__dirname}/web-entry"
    ],
    output:
      filename: "bundle.js"
      path: directory + "/public"
    resolveLoader: {
      modulesDirectories: ['node_modules', "#{__dirname}/../loaders"]
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
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
      modulesDirectories: [directory, "#{__dirname}/../isomorphic", 'node_modules']
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

  #### Build production js.
  webpack(compilerConfig).run (err, stats) ->
    callback err, stats

