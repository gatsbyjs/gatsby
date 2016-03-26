import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import Config from 'webpack-configurator'
const debug = require('debug')('gatsby:webpack-config')

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
      case 'static':
        return {
          path: `${directory}/public`,
          filename: 'bundle.js',
          libraryTarget: 'umd',
        }
      case 'production':
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
      case 'production':
        return [
          `${__dirname}/web-entry`,
        ]
      case 'static':
        return [
          `${__dirname}/static-entry`,
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
      case 'production':
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
          new ExtractTextPlugin('styles.css'),
          new webpack.optimize.UglifyJsPlugin(),
        ]
      case 'static':
        return [
          new StaticSiteGeneratorPlugin('bundle.js', routes),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : 'production'),
            },
            __PREFIX_LINKS__: program.prefixLinks,
          }),
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
      case 'static':
        return false
      case 'production':
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
      query: {
        plugins: ['add-module-exports'],
      },
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
            require('postcss-url')(),
            require('postcss-cssnext')({
              browsers: 'last 2 versions',
            }),
            require('postcss-browser-reporter'),
          ],
        })
        config.removeLoader('js')
        config.loader('js', {
          test: /\.jsx?$/, // Accept either .js or .jsx files.
          exclude: /(node_modules|bower_components)/,
          loader: 'babel',
          query: {
            presets: ['react-hmre', 'react', 'es2015', 'stage-1'],
            plugins: ['add-module-exports'],
          },
        })
        return config

      case 'static':
        config.loader('css', {
          test: /\.css$/,
          loaders: ['css'],
        })
        config.loader('less', {
          test: /\.less/,
          loaders: ['css', 'less'],
        })
        config.loader('sass', {
          test: /\.(sass|scss)/,
          loaders: ['css', 'sass'],
        })
        return config

      case 'production':
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
            require('postcss-url')(),
            require('postcss-cssnext')({
              browsers: 'last 2 versions',
            }),
            require('cssnano'),
          ],
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

  return module(config)
}
