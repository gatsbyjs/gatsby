webpack = require 'webpack'

module.exports = (program, callback) ->
  {relativeDirectory, directory} = program

  compilerConfig = {
    entry: [
      "#{__dirname}/web-entry"
    ],
    debug: true,
    output:
      filename: "bundle.js"
      path: directory + "/public"
    resolveLoader: {
      modulesDirectories: ["#{__dirname}/../../node_modules", "#{__dirname}/../loaders"]
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
      extensions: ['', '.js', '.jsx', '.cjsx', '.coffee', '.json', '.less', '.toml', '.yaml']
      modulesDirectories: [directory, "#{__dirname}/../isomorphic", "#{directory}/node_modules", "node_modules"]
    },
    module: {
      loaders: [
        { test: /\.css$/, loaders: ['style', 'css']},
        { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
        { test: /\.jsx/, loaders: ['babel']},
        { test: /\.less/, loaders: ['style', 'css', 'less']},
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

