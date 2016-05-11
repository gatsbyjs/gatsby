import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import Config from 'webpack-configurator'
const debug = require('debug')('gatsby:webpack-config')
import path from 'path'
import babelConfig from './babel-config'
let modifyWebpackConfig
try {
  const gatsbyNodeConfig = path.resolve(process.cwd(), './gatsby-node.js')
  const nodeConfig = require(gatsbyNodeConfig)
  modifyWebpackConfig = nodeConfig.modifyWebpackConfig
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    console.log(e)
  }
}

// Four stages:
//   1) develop: for `gatsby develop` command, hot reload and CSS injection into page
//   2) build-css: build styles.css file
//   3) build-html: build all HTML files
//   4) build-javascript: Build bundle.js for Single Page App in production

module.exports = (program, directory, stage, webpackPort = 1500, routes = []) => {
  debug(`Loading webpack config for stage "${stage}"`)
  function output () {
    switch (stage) {
      case 'develop':
        return {
          path: directory,
          filename: 'bundle.js',
          publicPath: `http://${program.host}:${webpackPort}/`,
        }
      case 'build-css':
        // Webpack will always generate a resultant javascript file.
        // But we don't want it for this step. Deleted by build-css.js.
        return {
          path: `${directory}/public`,
          filename: 'bundle-for-css.js',
        }
      case 'build-html':
        // A temp file required by static-site-generator-plugin. See plugins() below.
        // Deleted by build-html.js, since it's not needed for production.
        return {
          path: `${directory}/public`,
          filename: 'render-page.js',
          libraryTarget: 'umd',
        }
      case 'build-javascript':
        return {
          filename: 'bundle.js',
          path: `${directory}/public`,
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function entry () {
    switch (stage) {
      case 'develop':
        return [
          require.resolve('webpack-hot-middleware/client'),
          `${__dirname}/web-entry`,
        ]
      case 'build-css':
        return {
          main: `${__dirname}/web-entry`,
        }
      case 'build-html':
        return {
          main: `${__dirname}/static-entry`,
        }
      case 'build-javascript':
        return [
          `${__dirname}/web-entry`,
        ]
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function plugins () {
    switch (stage) {
      case 'develop':
        return [
          new webpack.optimize.OccurenceOrderPlugin(),
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoErrorsPlugin(),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : 'development'),
            },
            __PREFIX_LINKS__: program.prefixLinks,
          }),
        ]
      case 'build-css':
        return [
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : 'production'),
            },
            __PREFIX_LINKS__: program.prefixLinks,
          }),
          new ExtractTextPlugin('styles.css'),
        ]
      case 'build-html':
        return [
          new StaticSiteGeneratorPlugin('render-page.js', routes),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : 'production'),
            },
            __PREFIX_LINKS__: program.prefixLinks,
          }),
        ]
      case 'build-javascript':
        return [
          // Moment.js includes 100s of KBs of extra localization data
          // by default in Webpack that most sites don't want.
          // This line disables that.
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : 'production'),
            },
            __PREFIX_LINKS__: program.prefixLinks,
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin(),
        ]
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function resolve () {
    return {
      extensions: [
        '',
        '.js',
        '.jsx',
        '.cjsx',
        '.coffee',
        '.json',
        '.less',
        '.css',
        '.scss',
        '.sass',
        '.toml',
        '.yaml',
      ],
      modulesDirectories: [
        directory,
        `${__dirname}/../isomorphic`,
        `${directory}/node_modules`,
        'node_modules',
      ],
    }
  }

  function devtool () {
    switch (stage) {
      case 'develop':
        return 'eval'
      case 'build-html':
        return false
      case 'build-javascript':
        return 'source-map'
      default:
        return false
    }
  }

  function module (config) {
    // common config for every env
    config.loader('cjsx', {
      test: /\.cjsx$/,
      loaders: ['coffee', 'cjsx'],
    })
    config.loader('js', {
      test: /\.jsx?$/, // Accept either .js or .jsx files.
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: babelConfig(program, stage),
    })
    config.loader('coffee', {
      test: /\.coffee$/,
      loader: 'coffee',
    })
    config.loader('md', {
      test: /\.md$/,
      loader: 'markdown',
    })
    config.loader('html', {
      test: /\.html$/,
      loader: 'html',
    })
    config.loader('json', {
      test: /\.json$/,
      loaders: ['json'],
    })
    // Match everything except config.toml
    config.loader('toml', {
      test: /^((?!config).)*\.toml$/,
      loaders: ['toml'],
    })
    config.loader('yaml', {
      test: /\.yaml/,
      loaders: ['json', 'yaml'],
    })
    config.loader('png', {
      test: /\.png$/,
      loader: 'null',
    })
    config.loader('jpg', {
      test: /\.jpg$/,
      loader: 'null',
    })
    config.loader('gif', {
      test: /\.gif$/,
      loader: 'null',
    })
    config.loader('ico', {
      test: /\.ico$/,
      loader: 'null',
    })
    config.loader('pdf', {
      test: /\.pdf$/,
      loader: 'null',
    })
    config.loader('txt', {
      test: /\.txt$/,
      loader: 'null',
    })
    config.loader('config', {
      test: /config\.toml/,
      loader: 'config',
      query: {
        directory,
      },
    })
    // Font loaders
    config.loader('woff', {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&minetype=application/font-woff',
    })
    config.loader('ttf', {
      test: /\.(ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    })
    config.loader('eot', {
      test: /\.(eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    })
    config.loader('svg', {
      test: /\.(svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    })

    switch (stage) {
      case 'develop':
        config.loader('css', {
          test: /\.css$/,
          loaders: ['style', 'css', 'postcss'],
        })
        config.loader('less', {
          test: /\.less/,
          loaders: ['style', 'css', 'less'],
        })
        config.loader('sass', {
          test: /\.(sass|scss)/,
          loaders: ['style', 'css', 'sass'],
        })
        config.merge({
          postcss: [
            require('postcss-import')(),
            require('postcss-cssnext')({ browsers: 'last 2 versions' }),
            require('postcss-browser-reporter'),
            require('postcss-reporter'),
          ],
        })
        return config

      case 'build-css':
        config.loader('css', {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract(['css', 'postcss']),
        })
        config.loader('less', {
          test: /\.less/,
          loader: ExtractTextPlugin.extract(['css', 'less']),
        })
        config.loader('sass', {
          test: /\.(sass|scss)/,
          loader: ExtractTextPlugin.extract(['css', 'sass']),
        })
        config.merge({
          postcss: [
            require('postcss-import')(),
            require('postcss-cssnext')({
              browsers: 'last 2 versions',
            }),
            require('cssnano')({
              autoprefixer: false,
            }),
          ],
        })
        return config

      case 'build-html':
        // We don't deal with CSS at all when building the HTML.
        // The 'null' loader is used to prevent 'module not found' errors.

        config.loader('css', {
          test: /\.css$/,
          loader: 'null',
        })
        config.loader('less', {
          test: /\.less/,
          loader: 'null',
        })
        config.loader('sass', {
          test: /\.(sass|scss)/,
          loader: 'null',
        })
        return config

      case 'build-javascript':
        // We don't deal with CSS at all when building the javascript.
        // The 'null' loader is used to prevent 'module not found' errors.

        config.loader('css', {
          test: /\.css$/,
          loader: 'null',
        })
        config.loader('less', {
          test: /\.less/,
          loader: 'null',
        })
        config.loader('sass', {
          test: /\.(sass|scss)/,
          loader: 'null',
        })
        return config

      default:
        return config
    }
  }

  const config = new Config()

  config.merge({
    context: `${directory}/pages`,
    node: {
      __filename: true,
    },
    entry: entry(),
    debug: true,
    devtool: devtool(),
    output: output(),
    resolveLoader: {
      modulesDirectories: [
        `${directory}/node_modules`,
        `${directory}/loaders`,
        `${__dirname}/../../node_modules`,
        `${__dirname}/../loaders`,
      ],
    },
    plugins: plugins(),
    resolve: resolve(),
  })

  if (modifyWebpackConfig) {
    return modifyWebpackConfig(module(config), stage)
  } else {
    return module(config)
  }
}
