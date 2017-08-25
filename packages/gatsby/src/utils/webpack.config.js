import { uniq, some } from "lodash"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import StaticSiteGeneratorPlugin from "static-site-generator-webpack-plugin"
import { StatsWriterPlugin } from "webpack-stats-plugin"
import FriendlyErrorsWebpackPlugin from "friendly-errors-webpack-plugin"

const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)
const debug = require(`debug`)(`gatsby:webpack-config`)
const WebpackMD5Hash = require(`webpack-md5-hash`)
const ChunkManifestPlugin = require(`chunk-manifest-webpack-plugin`)
const GatsbyModulePlugin = require(`gatsby-module-loader/plugin`)
const { withBasePath } = require(`./path`)

const apiRunnerNode = require(`./api-runner-node`)
const createConfig = require(`./webpack-utils`)

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
  const directoryPath = withBasePath(directory)

  // We combine develop & develop-html stages for purposes of generating the
  // webpack config.
  const stage = suppliedStage
  const webpackConfig = await createConfig({ stage, program })
  const { rules, loaders, plugins } = webpackConfig

  function processEnv(stage, defaultNodeEnv) {
    debug(`Building env for "${stage}"`)
    const env = process.env.NODE_ENV
      ? process.env.NODE_ENV
      : `${defaultNodeEnv}`
    const envFile = path.join(process.cwd(), `./.env.${env}`)
    let parsed = {}
    try {
      parsed = dotenv.parse(fs.readFileSync(envFile, { encoding: `utf8` }))
    } catch (e) {
      if (e && e.code !== `ENOENT`) {
        console.log(e)
      }
    }
    const envObject = Object.keys(parsed).reduce((acc, key) => {
      acc[key] = JSON.stringify(parsed[key])
      return acc
    }, {})

    // Don't allow overwriting of NODE_ENV, PUBLIC_DIR as to not break gatsby things
    envObject.NODE_ENV = JSON.stringify(env)
    envObject.PUBLIC_DIR = JSON.stringify(`${process.cwd()}/public`)

    return envObject
  }

  debug(`Loading webpack config for stage "${stage}"`)
  function getOutput() {
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
          path: directoryPath(`public`),
          filename: `bundle-for-css.js`,
          publicPath: program.prefixPaths
            ? `${store.getState().config.pathPrefix}/`
            : `/`,
        }
      case `build-html`:
      case `develop-html`:
        // A temp file required by static-site-generator-plugin. See plugins() below.
        // Deleted by build-html.js, since it's not needed for production.
        return {
          path: directoryPath(`public`),
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
          path: directoryPath(`public`),
          publicPath: program.prefixPaths
            ? `${store.getState().config.pathPrefix}/`
            : `/`,
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function getEntry() {
    switch (stage) {
      case `develop`:
        return {
          commons: [
            require.resolve(`react-hot-loader/patch`),
            `${require.resolve(
              `webpack-hot-middleware/client`
            )}?path=http://${program.host}:${webpackPort}/__webpack_hmr&reload=true`,
            directoryPath(`.cache/app`),
          ],
        }
      case `develop-html`:
        return {
          main: directoryPath(`.cache/develop-static-entry`),
        }
      case `build-css`:
        return {
          main: directoryPath(`.cache/app`),
        }
      case `build-html`:
        return {
          main: directoryPath(`.cache/static-entry`),
        }
      case `build-javascript`:
        return {
          app: directoryPath(`.cache/production-app`),
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function getPlugins() {
    let configPlugins = [
      plugins.moment(),

      // There seems to be a bug in file-loader that assumes this will be set.
      plugins.loaderOptions({ fileLoader: {} }),

      // Add a few global variables. Set NODE_ENV to production (enables
      // optimizations for React) and whether prefixing links is enabled
      // (__PREFIX_PATHS__) and what the link prefix is (__PATH_PREFIX__).
      plugins.define({
        "process.env": processEnv(stage, `development`),
        __PREFIX_PATHS__: program.prefixPaths,
        __PATH_PREFIX__: JSON.stringify(store.getState().config.pathPrefix),
        __POLYFILL__: store.getState().config.polyfill,
      }),

      plugins.extractText({
        filename: stage === `build-css` ? `styles.css` : `${stage}.css`,
      }),
    ]

    switch (stage) {
      case `develop`:
        configPlugins = configPlugins.concat([
          plugins.hotModuleReplacement(),
          plugins.noErrors(),

          // Names module ids with their filepath. We use this in development
          // to make it easier to see what modules have hot reloaded, etc. as
          // the numerical IDs aren't useful. In production we use numerical module
          // ids to reduce filesize.
          plugins.namedModules(),
          new FriendlyErrorsWebpackPlugin({
            clearConsole: false,
            compilationSuccessInfo: {
              messages: [
                `Your site is running at http://localhost:${program.port}`,
                `Your graphql debugger is running at http://localhost:${program.port}/___graphql`,
              ],
            },
          }),
        ])
        break

      case `develop-html`:
      case `build-html`:
        configPlugins = configPlugins.concat([
          new StaticSiteGeneratorPlugin(`render-page.js`, pages),
        ])
        break
      case `build-javascript`: {
        // Get array of page template component names.
        let components = store
          .getState()
          .pages.map(page => page.componentChunkName)

        components = uniq(components)
        components.push(`layout-component---index`)

        configPlugins = configPlugins.concat([
          new WebpackMD5Hash(),

          // Extract "commons" chunk from the app entry and all
          // page components.
          plugins.commonsChunk({
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
                  const regex = new RegExp(`/node_modules/${vendor}/.*`, `i`)
                  return regex.test(module.resource)
                })
              )
              return isFramework || count > 3
            },
          }),
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
          plugins.uglify(),
          new GatsbyModulePlugin(),
          plugins.namedModules(),
          plugins.namedChunks(),
        ])
        break
      }
    }

    return configPlugins
  }

  function getDevtool() {
    switch (stage) {
      case `develop`:
        return `cheap-module-source-map`
      case `build-javascript`:
        return `source-map`
      case `build-html`:
      case `develop-html`:
      default:
        return false
    }
  }

  function getModule(config) {
    const browsers = program.browserslist
    const postcssPlugins = loader => [
      require(`postcss-import`)({ root: loader.resourcePath }),
      require(`postcss-cssnext`)({
        browsers,
        features: {
          rem: false, // only needed for <= ie8
          autoprefixer: false, // handled already
        },
      }),
      require(`postcss-browser-reporter`),
      require(`postcss-reporter`),
    ]

    const cssRule = rules.css({ plugins: postcssPlugins })
    const cssModulesRule = rules.cssModules({
      plugins: postcssPlugins,
    })

    // Common config for every env.
    // prettier-ignore
    let configRules = [
      rules.js(),
      rules.yaml(),
      rules.assets(),
      rules.images(),
    ]

    switch (stage) {
      case `develop`:
        configRules = configRules.concat([cssRule, cssModulesRule])
        break

      case `build-css`:
        configRules = configRules.concat([cssRule, cssModulesRule])
        break

      case `build-html`:
      case `develop-html`:
        // We don't deal with CSS at all when building the HTML.
        // The 'null' loader is used to prevent 'module not found' errors.
        // On the other hand CSS modules loaders are necessary.

        // prettier-ignore
        configRules = configRules.concat([
          {
            ...cssRule,
            use: loaders.null,
          },
          cssModulesRule,
        ])
        break

      case `build-javascript`:
        // we don't deal with css at all when building the javascript.  but
        // still need to process the css so offline-plugin knows about the
        // various assets referenced in your css.
        //
        // It's also necessary to process CSS Modules so your JS knows the
        // classNames to use.
        configRules = configRules.concat([cssRule, cssModulesRule])
        break
    }

    return { rules: configRules }
  }

  function getResolve() {
    const { program } = store.getState()
    return {
      // Use the program's extension list (generated via the
      // 'resolvableExtensions' API hook).
      extensions: [...program.extensions],
      // Default to using the site's node_modules directory to look for
      // modules. But also make it possible to install modules within the src
      // directory if you need to install a specific version of a module for a
      // part of your site.
      modules: [
        `node_modules`,
        directoryPath(`node_modules`),
        directoryPath(`node_modules`, `gatsby/node_modules`),
      ],
    }
  }

  function getResolveLoader() {
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
      modules: [...root, path.join(__dirname, `../loaders`), `node_modules`],
    }
  }

  const config = {
    // Context is the base directory for resolving the entry option.
    context: directory,
    entry: getEntry(),
    output: getOutput(),

    module: getModule(),
    plugins: getPlugins(),

    // Certain "isomorphic" packages have different entry points for browser
    // and server (see
    // https://github.com/defunctzombie/package-browser-field-spec); setting
    // the target tells webpack which file to include, ie. browser vs main.
    target: stage === `build-html` || stage === `develop-html` ? `node` : `web`,
    profile: stage === `production`,
    devtool: getDevtool(),

    resolveLoader: getResolveLoader(),
    resolve: getResolve(),

    node: {
      __filename: true,
    },
  }

  store.dispatch(actions.replaceWebpackConfig(config))
  const getConfig = () => store.getState().webpack

  await apiRunnerNode(`modifyWebpackConfig`, {
    getConfig,
    stage,
    rules,
    loaders,
    plugins,
  })

  return getConfig()
}
