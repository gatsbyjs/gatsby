var webpack = require('webpack');
var StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
var Config = require('webpack-configurator');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var gatsbyLib = /(gatsby.lib)/i;
var libDirs = /(node_modules|bower_components)/i;
var babelExcludeTest = function(absPath) {
    var result = false;
    if(absPath.match(gatsbyLib)) {
        // There is a match, don't exclude this file.
        result = false
    } else if(absPath.match(libDirs)) {
        // There is a match, do exclude this file.
        result = true
    } else {
        result = false
    }

    return result
}

module.exports = function(program, directory, stage, webpackPort, routes) {
    webpackPort = webpackPort || 1500;
    routes = routes || [];
    function output() {
        switch(stage) {
        case "develop":
            return {
                path: directory,
                filename: 'bundle.js',
                publicPath: `http://${program.host}:${webpackPort}/`
            }
        case "production":
            return {
                filename: "bundle.js",
                path: directory + "/public"
            }
        case "static":
            return {
                path: directory + "/public",
                filename: "bundle.js",
                libraryTarget: 'umd'
            }
        }
    }

    function entry() {
        switch(stage) {
        case "develop":
            return [
                `${__dirname}/../../node_modules/webpack-dev-server/client?${program.host}:${webpackPort}`,
                `${__dirname}/../../node_modules/webpack/hot/only-dev-server`,
                `${__dirname}/web-entry`
            ]
        case "production":
            return [
                `${__dirname}/web-entry`
            ]
        case "static":
            return [
                `${__dirname}/static-entry`
            ]
        }
    }

    function plugins() {
        switch(stage) {
        case "develop":
            return [
                new webpack.HotModuleReplacementPlugin(),
                new webpack.DefinePlugin({
                    "process.env": {
                        NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : "development")
                    },
                    __PREFIX_LINKS__: program.prefixLinks
                })
            ]
        case "production":
            return [
                new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
                new webpack.DefinePlugin({
                    "process.env": {
                        NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : "production")
                    },
                    __PREFIX_LINKS__: program.prefixLinks
                }),
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin()
            ]
        case "static":
            return [
                new StaticSiteGeneratorPlugin('bundle.js', routes),
                new webpack.DefinePlugin({
                    "process.env": {
                        NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : "production")
                    },
                    __PREFIX_LINKS__: program.prefixLinks
                })
            ]
        }
    }

    function resolve() {
        return {
            extensions: ['', '.js', '.jsx', '.cjsx', '.coffee', '.json', '.less', '.toml', '.yaml'],
            modulesDirectories: [
                directory,
                `${__dirname}/../isomorphic`,
                `${directory}/node_modules`,
                "node_modules"
            ]
        }
    }

    function devtool() {
        switch(stage) {
        case "develop":
        case "static":
            return "eval"
        case "production":
            return "source-map"
        }
    }

    function module(config) {

        // common config for every env
        config.loader('cjsx',{ test: /\.cjsx$/, loaders: ['coffee', 'cjsx']});
        config.loader('js',{
            test: /\.jsx?$/,
            exclude: babelExcludeTest,
            loaders: ['babel']
        });
        config.loader('coffee',{ test: /\.coffee$/, loader: 'coffee' });
        config.loader('md',{ test: /\.md$/, loader: 'markdown' });
        config.loader('html',{ test: /\.html$/, loader: 'raw' });
        config.loader('json',{ test: /\.json$/, loaders: ['json'] });
        config.loader('toml',{ test: /^((?!config).)*\.toml$/, loaders: ['toml'] }); // Match everything except config.toml
        config.loader('images',{ test: /\.(jpe?g|png|gif|svg)$/i, loaders: ['url?limit=10000', 'img-loader?progressive=true'] })
        config.loader('ico',{ test: /\.ico$/, loader: 'null' });
        config.loader('pdf',{ test: /\.pdf$/, loader: 'null' });
        config.loader('txt',{ test: /\.txt$/, loader: 'null' });
        config.loader('config',{ test: /config\.[toml|yaml|json]/, loader: 'config', query: {
            directory: directory
        } });

      var cssLoaderConfig = '?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
      switch(stage) {
        case "develop":
          config.loader('css', {
            test: /\.css$/,
            loaders: ['style', `css${cssLoaderConfig}`, 'postcss-loader']
          });
          config.merge({
            postcss: [
              require('postcss-import')(),
              require('postcss-url')(),
              require('postcss-cssnext')({
                browsers: 'last 2 versions'
              }),
              require('postcss-browser-reporter')
            ]
          })
            config.loader('less', { test: /\.less/, loaders: ['style', 'css', 'less']});
          config.loader('js', {}, (cfg) => {
            cfg.loaders.unshift('react-hot');
            return cfg;
          })
            config.loader('cjsx', {}, (cfg) => {
              cfg.loaders.unshift('react-hot');
              return cfg;
            })
            return config;

        case "static":
          config.loader('css', {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('style', `css${cssLoaderConfig}!postcss-loader`)
          });
          
          config.plugin('extract-css',
                        ExtractTextPlugin,
                        ["styles.css", { allChunks: true }]);
          config.merge({
            postcss: [
              require('postcss-import')(),
              require('postcss-url')(),
              require('postcss-cssnext')({
                browsers: 'last 2 versions'
              }),
              require('cssnano')({})
            ]
          })
            config.loader('less',{ test: /\.less/, loaders: ['css', 'less']});
          return config

        case "production":
          config.loader('css', {
            test: /\.css$/,
            loaders: [`css/locals${cssLoaderConfig}`, 'postcss-loader']});
            config.loader('less',{ test: /\.less/, loaders: ['style', 'css', 'less']});

            return config
        }
    }
    var config = new Config();

    config.merge({
        context: directory + "/pages",
        node: {
            __filename: true
        },
        entry: entry(),
        debug: true,
        devtool: devtool(),
        output: output(),
        resolveLoader: {
            modulesDirectories: [
                `${directory}/node_modules`,
                `${__dirname}/../../node_modules`,
                `${__dirname}/../loaders`
            ]
        },
        plugins: plugins(),
        resolve: resolve()
    });

    return module(config);
}
