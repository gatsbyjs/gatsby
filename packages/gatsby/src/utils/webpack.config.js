require(`v8-compile-cache`)

const fs = require(`fs`)
const path = require(`path`)
const dotenv = require(`dotenv`)
const StaticSiteGeneratorPlugin = require(`static-site-generator-webpack-plugin`)
const FriendlyErrorsWebpackPlugin = require(`friendly-errors-webpack-plugin`)
const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)
const debug = require(`debug`)(`gatsby:webpack-config`)
const report = require(`gatsby-cli/lib/reporter`)
const { withBasePath } = require(`./path`)

const apiRunnerNode = require(`./api-runner-node`)
const createUtils = require(`./webpack-utils`)

// Four stages or modes:
//   1) develop: for `gatsby develop` command, hot reload and CSS injection into page
//   2) develop-html: same as develop without react-hmre in the babel config for html renderer
//   3) build-javascript: Build JS and CSS chunks for production
//   4) build-html: build all HTML files

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
  const { rules, loaders, plugins } = await createUtils({ stage, program })

  function processEnv(stage, defaultNodeEnv) {
    debug(`Building env for "${stage}"`)
    const env = process.env.NODE_ENV
      ? process.env.NODE_ENV
      : `${defaultNodeEnv}`
    const envFile = path.join(process.cwd(), `./.env.${env}`)
    let parsed = {}
    try {
      parsed = dotenv.parse(fs.readFileSync(envFile, { encoding: `utf8` }))
    } catch (err) {
      if (err.code !== `ENOENT`) {
        report.error(`There was a problem processing the .env file`, err)
      }
    }

    const envObject = Object.keys(parsed).reduce((acc, key) => {
      acc[key] = JSON.stringify(parsed[key])
      return acc
    }, {})

    const gatsbyVarObject = Object.keys(process.env).reduce((acc, key) => {
      if (key.match(/^GATSBY_/)) {
        acc[key] = JSON.stringify(process.env[key])
      }
      return acc
    }, {})

    // Don't allow overwriting of NODE_ENV, PUBLIC_DIR as to not break gatsby things
    envObject.NODE_ENV = JSON.stringify(env)
    envObject.PUBLIC_DIR = JSON.stringify(`${process.cwd()}/public`)

    return Object.assign(envObject, gatsbyVarObject)
  }

  debug(`Loading webpack config for stage "${stage}"`)
  function getOutput() {
    switch (stage) {
      case `develop`:
        return {
          path: directory,
          filename: `[name].js`,
          publicPath: `http://${program.host}:${webpackPort}/`,
          // Add /* filename */ comments to generated require()s in the output.
          pathinfo: true,
          // Point sourcemap entries to original disk location (format as URL on Windows)
          devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, `/`),
        }
      case `build-html`:
      case `develop-html`:
        // A temp file required by static-site-generator-plugin. See plugins() below.
        // Deleted by build-html.js, since it's not needed for production.
        return {
          path: directoryPath(`public`),
          filename: `render-page.js`,
          libraryTarget: `umd`,
          library: `lib`,
          umdNamedDefine: true,
          globalObject: `this`,
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
            `${require.resolve(`webpack-hot-middleware/client`)}?path=http://${
              program.host
            }:${webpackPort}/__webpack_hmr&reload=true&overlay=false`,
            directoryPath(`.cache/app`),
          ],
        }
      case `develop-html`:
        return {
          main: directoryPath(`.cache/develop-static-entry`),
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

      // Add a few global variables. Set NODE_ENV to production (enables
      // optimizations for React) and whether prefixing links is enabled
      // (__PREFIX_PATHS__) and what the link prefix is (__PATH_PREFIX__).
      plugins.define({
        "process.env": processEnv(stage, `development`),
        __PREFIX_PATHS__: program.prefixPaths,
        __PATH_PREFIX__: JSON.stringify(store.getState().config.pathPrefix),
      }),

      plugins.extractText(
        stage === `develop`
          ? {
              filename: `[name].css`,
              chunkFilename: `[name].css`,
            }
          : {}
      ),
    ]

    switch (stage) {
      case `develop`:
        configPlugins = configPlugins.concat([
          plugins.hotModuleReplacement(),
          plugins.noEmitOnErrors(),

          new FriendlyErrorsWebpackPlugin({
            clearConsole: false,
            compilationSuccessInfo: {
              messages: [
                `You can now view your site in the browser running at http://${
                  program.host
                }:${program.port}`,
                `Your graphql debugger is running at http://${program.host}:${
                  program.port
                }/___graphql`,
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
        configPlugins = configPlugins.concat([
          // Minify Javascript.
          plugins.uglify({
            uglifyOptions: {
              compress: {
                drop_console: false,
              },
            },
          }),
          // Write out stats object mapping named dynamic imports (aka page
          // components) to all their async chunks.
          {
            apply: function(compiler) {
              compiler.plugin(`done`, function(stats, done) {
                let assets = {}

                for (let chunkGroup of stats.compilation.chunkGroups) {
                  if (chunkGroup.name) {
                    let files = []
                    for (let chunk of chunkGroup.chunks) {
                      files.push(...chunk.files)
                    }
                    assets[chunkGroup.name] = files.filter(
                      f => f.slice(-4) !== `.map`
                    )
                  }
                }

                fs.writeFile(
                  path.join(`public`, `webpack.stats.json`),
                  JSON.stringify({
                    assetsByChunkName: assets,
                  }),
                  done
                )
              })
            },
          },
        ])
        break
      }
    }

    return configPlugins
  }

  function getDevtool() {
    switch (stage) {
      case `develop`:
        return `eval`
      // use a normal `source-map` for the html phases since
      // it gives better line and column numbers
      case `develop-html`:
      case `build-html`:
      case `build-javascript`:
        return `source-map`
      default:
        return false
    }
  }

  function getMode() {
    switch (stage) {
      case `build-javascript`:
        return `production`
      case `develop`:
      case `develop-html`:
      case `build-html`:
        return `development` // So we don't uglify the html bundle
      default:
        return `production`
    }
  }

  function getModule(config) {
    // Common config for every env.
    // prettier-ignore
    let configRules = [
      rules.js(),
      rules.yaml(),
      rules.fonts(),
      rules.images(),
      rules.audioVideo(),
    ]
    switch (stage) {
      case `develop`:
        configRules = configRules.concat([
          {
            oneOf: [rules.cssModules(), rules.css()],
          },
        ])
        break

      case `build-html`:
      case `develop-html`:
        // We don't deal with CSS at all when building the HTML.
        // The 'null' loader is used to prevent 'module not found' errors.
        // On the other hand CSS modules loaders are necessary.

        // prettier-ignore
        configRules = configRules.concat([
          {
            oneOf: [
              rules.cssModules(),
              {
                ...rules.css(),
                use: [loaders.null()],
              },
            ],
          },
        ])
        break

      case `build-javascript`:
        // We don't deal with CSS at all when building JavaScript but we still
        // need to process the CSS so offline-plugin knows about the various
        // assets referenced in your CSS.
        //
        // It's also necessary to process CSS Modules so your JS knows the
        // classNames to use.
        configRules = configRules.concat([
          {
            oneOf: [rules.cssModules(), rules.css()],
          },

          // Remove manually unused React Router modules. Try removing these
          // rules whenever they get around to making a new release with their
          // tree shaking fixes.
          { test: /HashHistory/, use: `null-loader` },
          { test: /MemoryHistory/, use: `null-loader` },
          { test: /StaticRouter/, use: `null-loader` },
          { test: /MemoryRouter/, use: `null-loader` },
          { test: /HashRouter/, use: `null-loader` },
        ])

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
        directoryPath(path.join(`src`, `node_modules`)),
        directoryPath(`node_modules`),
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
    } catch (err) {
      debug(`Error resolving user loaders directory`, err)
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
    // Turn off performance hints as we (for now) don't want to show the normal
    // webpack output anywhere.
    performance: {
      hints: false,
    },
    mode: getMode(),

    resolveLoader: getResolveLoader(),
    resolve: getResolve(),

    node: {
      __filename: true,
    },
  }

  if (stage === `build-javascript`) {
    config.optimization = {
      runtimeChunk: {
        name: `webpack-runtime`,
      },
      splitChunks: {
        name: false,
      },
    }
  }

  store.dispatch(actions.replaceWebpackConfig(config))
  const getConfig = () => store.getState().webpack

  await apiRunnerNode(`onCreateWebpackConfig`, {
    getConfig,
    stage,
    rules,
    loaders,
    plugins,
  })

  return getConfig()
}
