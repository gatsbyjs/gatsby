import { uniq, some } from "lodash"
import fs from "fs"
import path from "path"
import webpack from "webpack"
import Config from "webpack-configurator"
import ExtractTextPlugin from "extract-text-webpack-plugin"
import StaticSiteGeneratorPlugin from "static-site-generator-webpack-plugin"
import { StatsWriterPlugin } from "webpack-stats-plugin"
// This isn't working right it seems.
// import WebpackStableModuleIdAndHash from 'webpack-stable-module-id-and-hash'

import webpackModifyValidate from "./webpack-modify-validate"

const { store } = require(`../redux`)
const debug = require(`debug`)(`gatsby:webpack-config`)
const WebpackMD5Hash = require(`webpack-md5-hash`)
const ChunkManifestPlugin = require(`chunk-manifest-webpack-plugin`)
const GatsbyModulePlugin = require(`../loaders/gatsby-module-loader/plugin`)
const genBabelConfig = require(`./babel-config`)
const { joinPath } = require(`./path`)

// Five stages or modes:
//   1) develop: for `gatsby develop` command, hot reload and CSS injection into page
//   2) develop-html: same as develop without react-hmre in the babel config for html renderer
//   3) build-css: build styles.css file
//   4) build-html: build all HTML files
//   5) build-javascript: Build js chunks for Single Page App in production

module.exports = async (
  program,
  directory,
  suppliedStage,
  webpackPort = 1500,
  pages = []
) => {
  const babelStage = suppliedStage

  // We combine develop & develop-html stages for purposes of generating the
  // webpack config.
  const stage = suppliedStage === `develop-html` ? `develop` : suppliedStage
  const babelConfig = await genBabelConfig(program, babelStage)

  debug(`Loading webpack config for stage "${stage}"`)
  function output() {
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
          path: joinPath(directory, `public`),
          filename: `bundle-for-css.js`,
          publicPath: program.prefixPaths
            ? `${store.getState().config.pathPrefix}/`
            : `/`,
        }
      case `build-html`:
        // A temp file required by static-site-generator-plugin. See plugins() below.
        // Deleted by build-html.js, since it's not needed for production.
        return {
          path: joinPath(directory, `public`),
          filename: `render-page.js`,
          libraryTarget: `umd`,
          publicPath: program.prefixPaths
            ? `${store.getState().config.pathPrefix}/`
            : `/`,
        }
      case `build-javascript`:
        return {
          filename: `[name]-[chunkhash].js`,
          chunkFilename: `[name]-[chunkhash].js`,
          path: joinPath(directory, `public`),
          publicPath: program.prefixPaths
            ? `${store.getState().config.pathPrefix}/`
            : `/`,
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function entry() {
    switch (stage) {
      case `develop`:
        return {
          commons: [
            require.resolve(`react-hot-loader/patch`),
            `${require.resolve(
              `webpack-hot-middleware/client`
            )}?path=http://${program.host}:${webpackPort}/__webpack_hmr&reload=true`,
            joinPath(directory, `.cache/app`),
          ],
        }
      case `build-css`:
        return {
          main: joinPath(directory, `.cache/app`),
        }
      case `build-html`:
        return {
          main: joinPath(directory, `.cache/static-entry`),
        }
      case `build-javascript`:
        return {
          app: joinPath(directory, `.cache/production-app`),
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function plugins() {
    switch (stage) {
      case `develop`:
        return [
          new webpack.optimize.OccurenceOrderPlugin(),
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoErrorsPlugin(),
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify(
                process.env.NODE_ENV ? process.env.NODE_ENV : `development`
              ),
              PUBLIC_DIR: JSON.stringify(`${process.cwd()}/public`),
            },
            __PREFIX_PATHS__: program.prefixPaths,
            __PATH_PREFIX__: JSON.stringify(store.getState().config.pathPrefix),
          }),
          // Names module ids with their filepath. We use this in development
          // to make it easier to see what modules have hot reloaded, etc. as
          // the numerical IDs aren't useful. In production we use numerical module
          // ids to reduce filesize.
          new webpack.NamedModulesPlugin(),
        ]
      case `build-css`:
        return [
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify(
                process.env.NODE_ENV ? process.env.NODE_ENV : `production`
              ),
              PUBLIC_DIR: JSON.stringify(`${process.cwd()}/public`),
            },
            __PREFIX_PATHS__: program.prefixPaths,
            __PATH_PREFIX__: JSON.stringify(store.getState().config.pathPrefix),
          }),
          new ExtractTextPlugin(`styles.css`, { allChunks: true }),
        ]
      case `build-html`:
        return [
          new StaticSiteGeneratorPlugin(`render-page.js`, pages),
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify(
                process.env.NODE_ENV ? process.env.NODE_ENV : `production`
              ),
              PUBLIC_DIR: JSON.stringify(`${process.cwd()}/public`),
            },
            __PREFIX_PATHS__: program.prefixPaths,
            __PATH_PREFIX__: JSON.stringify(store.getState().config.pathPrefix),
          }),
          new ExtractTextPlugin(`build-html-styles.css`),
        ]
      case `build-javascript`: {
        // Get array of page template component names.
        let components = store
          .getState()
          .pages.map(page => page.componentChunkName)
        components = uniq(components)
        components.push(`layout-component---index`)
        return [
          // Moment.js includes 100s of KBs of extra localization data
          // by default in Webpack that most sites don't want.
          // This line disables that.
          // TODO remove this now that loading moment.js isn't common w/ new
          // graphql data layer? Or just move to its own package with other
          // common webpack tweaks e.g. lodash?
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          new WebpackMD5Hash(),
          // new webpack.optimize.DedupePlugin(),
          // Extract "commons" chunk from the app entry and all
          // page components.
          new webpack.optimize.CommonsChunkPlugin({
            name: `commons`,
            chunks: [`app`, ...components],
            // The more page components there are, the higher we raise the bar
            // for merging in page-specific JS libs into the commons chunk. The
            // two principles here is a) keep the TTI (time to interaction) as
            // low as possible so that means keeping commons.js small with
            // critical framework code (e.g. React/react-router) and b) is we
            // want to push JS parse/eval work as close as possible to when
            // it's used. Since most people don't navigate to most pages, take
            // tradeoff of loading/evaling modules multiple times over
            // loading/evaling lots of unused code on the initial opening of
            // the app.
            minChunks: (module, count) => {
              const vendorModuleList = [
                `react`,
                `react-dom`,
                `fbjs`,
                `react-router`,
                `react-router-dom`,
                `react-router-scroll`,
                `dom-helpers`, // Used in react-router-scroll
                `path-to-regexp`,
                `isarray`, // Used by path-to-regexp.
                `scroll-behavior`,
                `history`,
                `resolve-pathname`, // Used by history.
                `value-equal`, // Used by history.
                `invariant`, // Used by history.
                `warning`, // Used by history.
                `babel-runtime`, // Used by history.
                `core-js`, // Used by history.
                `loose-envify`, // Used by history.
                `prop-types`,
                `gatsby-link`,
              ]
              const isFramework = some(
                vendorModuleList.map(vendor => {
                  const regex = new RegExp(`\/node_modules\/${vendor}\/.*`, `i`)
                  return regex.test(module.resource)
                })
              )
              return isFramework || count > 3
            },
          }),
          // Add a few global variables. Set NODE_ENV to production (enables
          // optimizations for React) and whether prefixing links is enabled
          // (__PREFIX_PATHS__) and what the link prefix is (__PATH_PREFIX__).
          new webpack.DefinePlugin({
            "process.env": {
              NODE_ENV: JSON.stringify(
                process.env.NODE_ENV ? process.env.NODE_ENV : `production`
              ),
              PUBLIC_DIR: JSON.stringify(`${process.cwd()}/public`),
            },
            __PREFIX_PATHS__: program.prefixPaths,
            __PATH_PREFIX__: JSON.stringify(store.getState().config.pathPrefix),
          }),
          // Extract CSS so it doesn't get added to JS bundles.
          new ExtractTextPlugin(`build-js-styles.css`),
          // Write out mapping between chunk names and their hashed names. We use
          // this to add the needed javascript files to each HTML page.
          new StatsWriterPlugin(),
          // Extract the webpack chunk manifest out of commons.js so commons.js
          // doesn't get changed everytime you build. This increases the cache-hit
          // rate for commons.js.
          new ChunkManifestPlugin({
            filename: `chunk-manifest.json`,
            manifestVariable: `webpackManifest`,
          }),
          // Minify Javascript.
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              screw_ie8: true, // React doesn't support IE8
              warnings: false,
            },
            mangle: {
              screw_ie8: true,
            },
            output: {
              comments: false,
              screw_ie8: true,
            },
          }),
          // Ensure module order stays the same. Supposibly fixed in webpack 2.0.
          new webpack.optimize.OccurenceOrderPlugin(),
          new GatsbyModulePlugin(),
          // new WebpackStableModuleIdAndHash({ seed: 9, hashSize: 47 }),
          new webpack.NamedModulesPlugin(),
        ]
      }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function resolve() {
    const { program } = store.getState()
    return {
      // Use the program's extension list (generated via the
      // 'resolvableExtensions' API hook).
      extensions: [``, ...program.extensions],
      // Default to using the site's node_modules directory to look for
      // modules. But also make it possible to install modules within the src
      // directory if you need to install a specific version of a module for a
      // part of your site.
      modulesDirectories: [
        joinPath(directory, `node_modules`),
        `node_modules`,
        `node_modules/gatsby/node_modules`,
      ],
    }
  }

  function devtool() {
    switch (stage) {
      case `develop`:
        return `cheap-module-source-map`
      case `build-html`:
        return false
      case `build-javascript`:
        return `source-map`
      default:
        return false
    }
  }

  function module(config) {
    // Common config for every env.
    config.loader(`js`, {
      test: /\.jsx?$/, // Accept either .js or .jsx files.
      exclude: /(node_modules|bower_components)/,
      loader: `babel`,
      query: babelConfig,
    })
    config.loader(`json`, {
      test: /\.json$/,
      loaders: [`json`],
    })
    config.loader(`yaml`, {
      test: /\.ya?ml/,
      loaders: [`json`, `yaml`],
    })

    // "file" loader makes sure those assets end up in the `public` folder.
    // When you `import` an asset, you get its filename.
    config.loader(`file-loader`, {
      test: /\.(ico|eot|otf|webp|ttf|woff(2)?)(\?.*)?$/,
      loader: `file`,
      query: {
        name: `static/[name].[hash:8].[ext]`,
      },
    })
    // "url" loader works just like "file" loader but it also embeds
    // assets smaller than specified size as data URLs to avoid requests.
    config.loader(`url-loader`, {
      test: /\.(svg|jpg|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
      loader: `url`,
      query: {
        limit: 10000,
        name: `static/[name].[hash:8].[ext]`,
      },
    })

    const cssModulesConf = `css?modules&minimize&importLoaders=1`
    const cssModulesConfDev = `${cssModulesConf}&sourceMap&localIdentName=[name]---[local]---[hash:base64:5]`

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
          postcss(wp) {
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
          exclude: /\.module\.css$/,
          loader: ExtractTextPlugin.extract([`css?minimize`, `postcss`]),
        })

        // CSS modules
        config.loader(`cssModules`, {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(`style`, [
            cssModulesConf,
            `postcss`,
          ]),
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
          loader: ExtractTextPlugin.extract(`style`, [
            cssModulesConf,
            `postcss`,
          ]),
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
          // loader: `null`,
          loader: ExtractTextPlugin.extract([`css`]),
        })

        // CSS modules
        config.loader(`cssModules`, {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(`style`, [
            cssModulesConf,
            `postcss`,
          ]),
        })

        return config

      default:
        return config
    }
  }

  function resolveLoader() {
    const root = [path.resolve(directory, `node_modules`)]

    const userLoaderDirectoryPath = path.resolve(directory, `loaders`)

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
      modulesDirectories: [path.join(__dirname, `../loaders`), `node_modules`],
    }
  }

  const config = new Config()

  config.merge({
    // Context is the base directory for resolving the entry option.
    context: directory,
    node: {
      __filename: true,
    },
    entry: entry(),
    debug: true,
    // Certain "isomorphic" packages have different entry points for browser
    // and server (see
    // https://github.com/defunctzombie/package-browser-field-spec); setting
    // the target tells webpack which file to include, ie. browser vs main.
    target: stage === `build-html` ? `node` : `web`,
    profile: stage === `production`,
    devtool: devtool(),
    output: output(),
    resolveLoader: resolveLoader(),
    plugins: plugins(),
    resolve: resolve(),
  })

  module(config, stage)

  // Use the suppliedStage again to let plugins distinguish between
  // server rendering the html.js and the frontend development config.
  const validatedConfig = await webpackModifyValidate(config, suppliedStage)

  return validatedConfig
}
