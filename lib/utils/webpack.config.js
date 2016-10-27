import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import Config from 'webpack-configurator'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'
import { StatsWriterPlugin } from 'webpack-stats-plugin'
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin'

import webpackModifyValidate from './webpack-modify-validate'

const debug = require(`debug`)(`gatsby:webpack-config`)
const WebpackMD5Hash = require(`webpack-md5-hash`)
const OfflinePlugin = require(`offline-plugin`)
const ChunkManifestPlugin = require(`chunk-manifest-webpack-plugin`)
const { pagesDB, siteDB } = require(`../utils/globals`)
const { layoutComponentChunkName } = require(`./js-chunk-names`)
const babelConfig = require(`./babel-config`)

// Five stages or modes:
//   1) develop: for `gatsby develop` command, hot reload and CSS injection into page
//   2) develop-html: same as develop without react-hmre in the babel config for html renderer
//   3) build-css: build styles.css file
//   4) build-html: build all HTML files
//   5) build-javascript: Build js chunks for Single Page App in production

module.exports = (program, directory, suppliedStage, webpackPort = 1500, pages = []) => {
  const babelStage = suppliedStage
  const stage = (suppliedStage === `develop-html`) ? `develop` : suppliedStage

  debug(`Loading webpack config for stage "${stage}"`)
  function output () {
    switch (stage) {
      case `develop`:
        return {
          path: directory,
          filename: `[name].js`,
          publicPath: `http://${program.host}:${webpackPort}/`,
        }
      case `build-css`:
        // Webpack will always generate a resultant javascript file.
        // But we don't want it for this step. Deleted by build-css.js.
        return {
          path: `${directory}/public`,
          filename: `bundle-for-css.js`,
          publicPath: program.prefixLinks ? `${siteDB().get(`config`).linkPrefix}/` : `/`,
        }
      case `build-html`:
        // A temp file required by static-site-generator-plugin. See plugins() below.
        // Deleted by build-html.js, since it's not needed for production.
        return {
          path: `${directory}/public`,
          filename: `render-page.js`,
          libraryTarget: `umd`,
          publicPath: program.prefixLinks ? `${siteDB().get(`config`).linkPrefix}/` : `/`,
        }
      case `build-javascript`:
        return {
          //filename: '[name].js',
          filename: `[name]-[chunkhash].js`,
          chunkFilename: `[name]-[chunkhash].js`,
          path: `${directory}/public`,
          publicPath: program.prefixLinks ? `${siteDB().get(`config`).linkPrefix}/` : `/`,
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function entry () {
    switch (stage) {
      case `develop`:
        return {
          commons: [
            `${require.resolve('webpack-dev-server/client')}?http://${program.host}:${webpackPort}/`,
            require.resolve(`webpack/hot/only-dev-server`),
            require.resolve(`react-hot-loader/patch`),
            `${directory}/.intermediate-representation/app`,
          ],
        }
      case `build-css`:
        return {
          main: `${directory}/.intermediate-representation/app`,
        }
      case `build-html`:
        return {
          main: `${__dirname}/static-entry`,
        }
      case `build-javascript`:
        return {
          app: `${directory}/.intermediate-representation/production-app`,
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function plugins () {
    switch (stage) {
      case `develop`:
        return [
          new webpack.optimize.OccurenceOrderPlugin(),
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoErrorsPlugin(),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : `development`),
            },
            __PREFIX_LINKS__: program.prefixLinks,
            __LINK_PREFIX__: JSON.stringify(siteDB().get(`config`).linkPrefix),
          }),
          new HardSourceWebpackPlugin({
            cacheDirectory: `${process.cwd()}/.cache/[confighash]`,
            recordsPath: `${process.cwd()}/.cache/[confighash]/records.json`,
            configHash: (webpackConfig) => stage,
            environmentPaths: {
              root: process.cwd(),
              directories: ['node_modules'],
              files: ['package.json'],
            },
          }),
        ]
      case `build-css`:
        return [
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : `production`),
            },
            __PREFIX_LINKS__: program.prefixLinks,
            __LINK_PREFIX__: JSON.stringify(siteDB().get(`config`).linkPrefix),
          }),
          new ExtractTextPlugin(`styles.css`, { allChunks: true }),
          new HardSourceWebpackPlugin({
            cacheDirectory: `${process.cwd()}/.cache/[confighash]`,
            recordsPath: `${process.cwd()}/.cache/[confighash]/records.json`,
            configHash: (webpackConfig) => stage,
            environmentPaths: {
              root: process.cwd(),
              directories: ['node_modules'],
              files: ['package.json'],
            },
          }),
        ]
      case `build-html`:
        return [
          new StaticSiteGeneratorPlugin(`render-page.js`, pages),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : `production`),
            },
            __PREFIX_LINKS__: program.prefixLinks,
            __LINK_PREFIX__: JSON.stringify(siteDB().get(`config`).linkPrefix),
          }),
          new ExtractTextPlugin(`build-html-styles.css`),
          new HardSourceWebpackPlugin({
            cacheDirectory: `${process.cwd()}/.cache/[confighash]`,
            recordsPath: `${process.cwd()}/.cache/[confighash]/records.json`,
            configHash: (webpackConfig) => stage,
            environmentPaths: {
              root: process.cwd(),
              directories: ['node_modules'],
              files: ['package.json'],
            },
          }),
        ]
      case `build-javascript`: {
        // Get array of page template component names.
        let components = Array.from(pagesDB().values()).map(page => page.component)
        components = components.map(component => layoutComponentChunkName(program.directory, component))
        components = _.uniq(components)
        return [
          // Moment.js includes 100s of KBs of extra localization data
          // by default in Webpack that most sites don't want.
          // This line disables that.
          // TODO remove this now that loading moment.js isn't common w/ new
          // graphql data layer?
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new WebpackMD5Hash(),
          new webpack.optimize.DedupePlugin(),
          // Extract "commons" chunk from the app entry and all
          // page components.
          new webpack.optimize.CommonsChunkPlugin({
            name: `commons`,
            chunks: [
              `app`,
              ...components,
            ],
            // The more page components there are, the higher we raise the bar
            // for merging in page-specific JS libs into the commons chunk. The
            // two principles here is a) keep the TTI (time to interaction) as
            // low as possible so that means keeping commons.js small with
            // critical code (e.g. React) and b) is we want to push JS
            // parse/eval work as close as possible to when it's used.  Since
            // most people don't navigate to most pages, take tradeoff of
            // loading/evaling modules multiple times over loading/evaling lots
            // of unused code on the initial opening of the app.
            //
            // Use Math.max as there must be at least two chunks.
            minChunks: Math.max(2, Math.floor(components.length / 2)),
          }),
          // Add a few global variables. Set NODE_ENV to production (enables
          // optimizations for React) and whether prefixing links is enabled
          // (__PREFIX_LINKS__) and what the link prefix is (__LINK_PREFIX__).
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV ? process.env.NODE_ENV : `production`),
            },
            __PREFIX_LINKS__: program.prefixLinks,
            __LINK_PREFIX__: JSON.stringify(siteDB().get(`config`).linkPrefix),
          }),
          // Extract CSS so it doesn't get added to JS bundles.
          new ExtractTextPlugin(`build-js-styles.css`),
          // Write out mapping between chunk names and their hashed names. We use
          // this to add the needed javascript files to each HTML page.
          new StatsWriterPlugin(),
          // Extract the webpack chunk manifest out of commons.js so commons.js
          // doesn't get changed everytime you build. This increases the cache-hit
          // rate for commons.js.
          //new ChunkManifestPlugin({
            //filename: "chunk-manifest.json",
            //manifestVariable: "webpackManifest"
          //}),
          // Minify Javascript.
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              screw_ie8: true, // React doesn't support IE8
              warnings: false
            },
            mangle: {
              screw_ie8: true
            },
            output: {
              comments: false,
              screw_ie8: true
            }
          }),
          // Ensure module order stays the same. Supposibly fixed in webpack 2.0.
          new webpack.optimize.OccurenceOrderPlugin(),
          // Enable the offline plugin to add a service worker.
          new OfflinePlugin({
            AppCache: false,
            publicPath: program.prefixLinks ? `${siteDB().get(`config`).linkPrefix}/` : `/`,
            relativePaths: false,
            ServiceWorker: {
              events: true,
            },
          }),
          new HardSourceWebpackPlugin({
            cacheDirectory: `${process.cwd()}/.cache/[confighash]`,
            recordsPath: `${process.cwd()}/.cache/[confighash]/records.json`,
            configHash: (webpackConfig) => stage,
            environmentPaths: {
              root: process.cwd(),
              directories: ['node_modules'],
              files: ['package.json'],
            },
          }),
        ]
      }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function resolve () {
    return {
      extensions: [
        ``,
        `.js`,
        `.jsx`,
        `.cjsx`,
        `.coffee`,
      ],
      // Hierarchy of directories for Webpack to look for module.
      // First is the site directory.
      // Then in the special directory of isomorphic modules Gatsby ships with.
      // Then the site's node_modules directory
      root: [
        directory,
        path.resolve(__dirname, `..`, `isomorphic`),
      ],
      modulesDirectories: [
        `${directory}/node_modules`,
        `node_modules`,
      ],
    }
  }

  function devtool () {
    switch (stage) {
      case `develop`:
        return `eval`
      case `build-html`:
        return false
      case `build-javascript`:
        return `source-map`
      default:
        return false
    }
  }

  function module (config) {
    // Common config for every env.
    config.loader(`cjsx`, {
      test: /\.cjsx$/,
      loaders: [`coffee`, `cjsx`],
    })
    config.loader(`js`, {
      test: /\.jsx?$/, // Accept either .js or .jsx files.
      exclude: /(node_modules|bower_components)/,
      loader: `babel`,
      query: babelConfig(program, babelStage),
    })
    config.loader(`coffee`, {
      test: /\.coffee$/,
      loader: `coffee`,
    })
    config.loader(`json`, {
      test: /\.json$/,
      loaders: [`json`],
    })
    // "file" loader makes sure those assets end up in the `public` folder.
    // When you `import` an asset, you get its filename.
    config.loader(`file-loader`, {
      test: /\.(ico|eot|otf|webp|ttf)(\?.*)?$/,
      loader: 'file',
      query: {
        name: 'static/[name].[hash:8].[ext]'
      }
    })
    // "url" loader works just like "file" loader but it also embeds
    // assets smaller than specified size as data URLs to avoid requests.
    config.loader(`url-loader`, {
      test: /\.(svg|jpg|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
      loader: 'url',
      query: {
        limit: 7500,
        name: 'static/[name].[hash:8].[ext]'
      }
    })
    // Font loader.
    config.loader(`woff`, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: `url`,
      query: {
        limit: 15000, // Set high limit for inlining fonts as they're in the
        // critical path for rendering.
        name: `static/[name].[hash:8].[ext]`,
        mimetype: `application/font-woff`,
      }
    })

    const cssModulesConf = `css?modules&minimize&importLoaders=1`
    const cssModulesConfDev =
      `${cssModulesConf}&sourceMap&localIdentName=[name]---[local]---[hash:base64:5]`

    switch (stage) {
      case `develop`:

        config.loader(`css`, {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          loaders: [`style`, `css`, `postcss`],
        })

        // CSS modules
        config.loader(`cssModules`, {
          test: /\.module\.css$/,
          loaders: [`style`, cssModulesConfDev, `postcss`],
        })

        config.merge({
          postcss (wp) {
            return [
              require(`postcss-import`)({ addDependencyTo: wp }),
              require(`postcss-cssnext`)({ browsers: `last 2 versions` }),
              require(`postcss-browser-reporter`),
              require(`postcss-reporter`),
            ]
          },
        })
        return config

      case `build-css`:
        config.loader(`css`, {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract([`css?minimize`, `postcss`]),
          exclude: /\.module\.css$/,
        })

        // CSS modules
        config.loader(`cssModules`, {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(`style`, [cssModulesConf, `postcss`]),
        })
        config.merge({
          postcss: [
            require(`postcss-import`)(),
            require(`postcss-cssnext`)({
              browsers: `last 2 versions`,
            }),
          ],
        })
        return config

      case `build-html`:
        // We don't deal with CSS at all when building the HTML.
        // The 'null' loader is used to prevent 'module not found' errors.
        // On the other hand CSS modules loaders are necessary.

        config.loader(`css`, {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          loader: `null`,
        })

        // CSS modules
        config.loader(`cssModules`, {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(`style`, [cssModulesConf, `postcss`]),
        })

        return config

      case `build-javascript`:
        // we don't deal with css at all when building the javascript.  but
        // still need to process the css so offline-plugin knows about the
        // various assets referenced in your css.
        //
        // It's also necessary to process CSS Modules so your JS knows the
        // classNames to use.

        config.loader(`css`, {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          //loader: `null`,
          loader: ExtractTextPlugin.extract([`css`]),
        })

        // CSS modules
        config.loader(`cssModules`, {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(`style`, [cssModulesConf, `postcss`]),
        })

        return config

      default:
        return config
    }
  }

  function resolveLoader () {
    const root = [
      path.resolve(directory, `node_modules`),
    ]

    const userLoaderDirectoryPath = path.resolve(directory, 'loaders')

    try {
      if (fs.statSync(userLoaderDirectoryPath).isDirectory()) {
        root.push(userLoaderDirectoryPath)
      }
    } catch (e) {
      if (e && e.code !== `ENOENT`) {
        console.log(e)
      }
    }

    return {
      root,
      modulesDirectories: [
        `node_modules`,
      ],
    }
  }

  const config = new Config()

  config.merge({
    // Context is the base directory for resolving the entry option.
    context: `${directory}`,
    node: {
      __filename: true,
    },
    entry: entry(),
    debug: true,
    // Certain "isomorphic" packages have different entry points for browser and server
    // (see https://github.com/defunctzombie/package-browser-field-spec);
    // setting the target tells webpack which file to include, ie. browser vs main.
    target: stage === `build-html` ? `node` : `web`,
    profile: stage === `production`,
    devtool: devtool(),
    output: output(),
    resolveLoader: resolveLoader(),
    plugins: plugins(),
    resolve: resolve(),
  })

  return webpackModifyValidate(module, config, stage)
}
