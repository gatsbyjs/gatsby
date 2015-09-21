import webpack from 'webpack';
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin';

module.exports = function(program, directory, stage, webpackPort = 1500, routes=[]) {
  var output = function() {
    switch (stage) {
      case "serve":
        return {path: directory,
        filename: 'bundle.js',
        publicPath: `http://${program.host}:${webpackPort}/`};
      case "production":
        return {filename: "bundle.js",
        path: directory + "/public"};
      case "static":
        return {path: directory + "/public",
        filename: "bundle.js",
        libraryTarget: 'umd'};
    }
  };

  var entry = function() {
    switch (stage) {
      case "serve":
        return [
          `${__dirname}/../../node_modules/webpack-dev-server/client?${program.host}:${webpackPort}`,
          `${__dirname}/../../node_modules/webpack/hot/only-dev-server`,
          `${__dirname}/web-entry`
        ];
      case "production":
        return [
          `${__dirname}/web-entry`
        ];
      case "static":
        return [
          `${__dirname}/static-entry`
        ];
    }
  };

  var plugins = function() {
    switch (stage) {
      case "serve":
        return [
          new webpack.HotModuleReplacementPlugin(),
          new webpack.DefinePlugin({
            __GH_PAGES__: JSON.stringify(JSON.parse(process.env.GATSBY_ENV === "gh-pages"))
          })
        ];
      case "production":
        return [
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify("production")
            },
            __GH_PAGES__: JSON.stringify(JSON.parse(process.env.GATSBY_ENV === "gh-pages"))
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin()
        ];
      case "static":
        return [
          new StaticSiteGeneratorPlugin('bundle.js', routes),
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify("production")
            },
            __GH_PAGES__: JSON.stringify(JSON.parse(process.env.GATSBY_ENV === "gh-pages"))
          })
        ];
    }
  };

  var resolve = function() {
    return {
      extensions: ['', '.js', '.jsx', '.cjsx', '.coffee', '.json', '.less', '.toml', '.yaml'],
      modulesDirectories: [directory, `${__dirname}/../isomorphic`, `${directory}/node_modules`, "node_modules"]
    };
  };

  var module = function() {
    switch (stage) {
      case "serve":
        return {loaders: [
          { test: /\.css$/, loaders: ['style', 'css']},
          { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['react-hot', 'babel']
          },
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['react-hot', 'babel']
          },
          { test: /\.less/, loaders: ['style', 'css', 'less']},
          { test: /\.coffee$/, loader: 'coffee' },
          { test: /\.md$/, loader: 'markdown' },
          { test: /\.html$/, loader: 'raw' },
          { test: /\.json$/, loaders: ['json'] },
          { test: /^((?!config).)*\.toml$/, loaders: ['toml'] }, // Match everything except config.toml
          { test: /\.png$/, loader: 'null' },
          { test: /\.jpg$/, loader: 'null' },
          { test: /\.svg$/, loader: 'null' },
          { test: /\.ico$/, loader: 'null' },
          { test: /\.pdf$/, loader: 'null' },
          { test: /\.txt$/, loader: 'null' },
          { test: /config\.[toml|yaml|json]/, loader: 'config', query: {
            directory: directory
          } }
        ]};
      case "static":
        return {loaders: [
          { test: /\.css$/, loaders: ['css']},
          { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['babel']
          },
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['babel']
          },
          { test: /\.less/, loaders: ['css', 'less']},
          { test: /\.coffee$/, loader: 'coffee' },
          { test: /\.md$/, loader: 'markdown' },
          { test: /\.html$/, loader: 'raw' },
          { test: /\.json$/, loaders: ['json'] },
          { test: /^((?!config).)*\.toml$/, loaders: ['toml'] }, // Match everything except config.toml
          { test: /\.png$/, loader: 'null' },
          { test: /\.jpg$/, loader: 'null' },
          { test: /\.svg$/, loader: 'null' },
          { test: /\.ico$/, loader: 'null' },
          { test: /\.pdf$/, loader: 'null' },
          { test: /\.txt$/, loader: 'null' },
          { test: /config\.[toml|yaml|json]/, loader: 'config', query: {
            directory: directory
          } }
        ]};
      case "production":
        return {loaders: [
          { test: /\.css$/, loaders: ['style', 'css']},
          { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['babel']
          },
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: ['babel']
          },
          { test: /\.less/, loaders: ['style', 'css', 'less']},
          { test: /\.coffee$/, loader: 'coffee' },
          { test: /\.md$/, loader: 'markdown' },
          { test: /\.html$/, loader: 'raw' },
          { test: /\.json$/, loaders: ['json'] },
          { test: /^((?!config).)*\.toml$/, loaders: ['toml'] }, // Match everything except config.toml
          { test: /\.png$/, loader: 'null' },
          { test: /\.jpg$/, loader: 'null' },
          { test: /\.svg$/, loader: 'null' },
          { test: /\.ico$/, loader: 'null' },
          { test: /\.pdf$/, loader: 'null' },
          { test: /\.txt$/, loader: 'null' },
          { test: /config\.[toml|yaml|json]/, loader: 'config', query: {
            directory: directory
          } }
        ]};
    }
  };
  return {
    context: directory + "/pages",
    node: {
      __filename: true
    },
    entry: entry(),
    debug: true,
    devtool: 'eval',
    output: output(),
    resolveLoader: {
      modulesDirectories: [`${__dirname}/../../node_modules`, `${__dirname}/../loaders`]
    },
    plugins: plugins(),
    resolve: resolve(),
    module: module()
  };
};
