import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'
import Config from 'webpack-configurator'
import published from '../../bin/published'

let gatsbyLib = /(gatsby.lib)/i
// If installed globally, look for "dist" directory instead.
if (published) {
  gatsbyLib = /(gatsby.dist)/i
}

const libDirs = /(node_modules|bower_components)/i
const babelExcludeTest = (absPath) => {
  let result = false
  if (absPath.match(gatsbyLib)) {
    // There is a match, don't exclude this file.
    result = false
  } else if (absPath.match(libDirs)) {
    // There is a match, do exclude this file.
    result = true
  } else {
    result = false
  }

  return result
}

module.exports = (program, directory, stage, webpackPort = 1500, routes = []) => {
  function output () {
    switch (stage) {
      case 'develop':
        return {
          path: directory,
          filename: 'bundle.js',
          publicPath: `http://${program.host}:${webpackPort}/`,
        }
      case 'production':
        return {
          filename: 'bundle.js',
          path: directory + '/public',
        }
      case 'static':
        return {
          path: directory + '/public',
          filename: 'bundle.js',
          libraryTarget: 'umd',
        }
      default:
        throw new Error('The state requested ' + stage + " doesn't exist.")
    }
  }

  function entry () {
    switch (stage) {
      case 'develop':
        return [
          require.resolve('webpack-dev-server/client') + `?${program.host}:${webpackPort}`,
          require.resolve('webpack/hot/only-dev-server'),
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
        throw new Error('The state requested ' + stage + " doesn't exist.")
    }
  }

  function plugins () {
    switch (stage) {
      case 'develop':
        return [
          new webpack.HotModuleReplacementPlugin(),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : 'development'),
            },
            __PREFIX_LINKS__: program.prefixLinks,
          }),
        ]
      case 'production':
        return [
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
        throw new Error('The state requested ' + stage + " doesn't exist.")
    }
  }

  function resolve () {
    return {
      extensions: ['', '.js', '.jsx', '.cjsx', '.coffee', '.json', '.less', '.toml', '.yaml'],
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
      case 'static':
        return 'eval'
      case 'production':
        return 'source-map'
      default:
    }
  }

  function module (config) {
    // common config for every env
    config.loader('cjsx', {
      test: /\.cjsx$/,
      loaders: ['coffee', 'cjsx'],
    })
    config.loader('js', {
      test: /\.jsx?$/,
      exclude: babelExcludeTest,
      loaders: ['babel'],
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
      loader: 'raw',
    })
    config.loader('json', {
      test: /\.json$/,
      loaders: ['json'],
    })
    config.loader('toml', {
      test: /^((?!config).)*\.toml$/,
      loaders: ['toml'],
    })
    // Match everything except config.toml
    config.loader('png', {
      test: /\.png$/,
      loader: 'null',
    })
    config.loader('jpg', {
      test: /\.jpg$/,
      loader: 'null',
    })
    config.loader('svg', {
      test: /\.svg$/,
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
      test: /config\.[toml|yaml|json]/,
      loader: 'config',
      query: {
        directory: directory,
      },
    })

    switch (stage) {
      case 'develop':
        config.loader('css', {
          test: /\.css$/,
          loaders: ['style', 'css'],
        })
        config.loader('less', {
          test: /\.less/,
          loaders: ['style', 'css', 'less'],
        })
        config.loader('js', {}, (cfg) => {
          cfg.loaders.unshift('react-hot')
          return cfg
        })
        config.loader('cjsx', {}, (cfg) => {
          cfg.loaders.unshift('react-hot')
          return cfg
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
        return config

      case 'production':
        config.loader('css', {
          test: /\.css$/,
          loaders: ['style', 'css'],
        })
        config.loader('less', {
          test: /\.less/,
          loaders: ['style', 'css', 'less'],
        })

        return config

      default:
    }
  }

  const config = new Config()

  config.merge({
    context: directory + '/pages',
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
        `${__dirname}/../../node_modules`,
        `${__dirname}/../loaders`,
      ],
    },
    plugins: plugins(),
    resolve: resolve(),
  })

  return module(config)
}
