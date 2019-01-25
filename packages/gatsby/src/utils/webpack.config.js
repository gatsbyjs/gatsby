require(`v8-compile-cache`)

const fs = require(`fs-extra`)
const path = require(`path`)
const dotenv = require(`dotenv`)
const FriendlyErrorsWebpackPlugin = require(`friendly-errors-webpack-plugin`)
const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)
const debug = require(`debug`)(`gatsby:webpack-config`)
const report = require(`gatsby-cli/lib/reporter`)
const { withBasePath } = require(`./path`)

const apiRunnerNode = require(`./api-runner-node`)
const createUtils = require(`./webpack-utils`)
const hasLocalEslint = require(`./local-eslint-config-finder`)

// Four stages or modes:
//   1) develop: for `gatsby develop` command, hot reload and CSS injection into page
//   2) develop-html: same as develop without react-hmre in the babel config for html renderer
//   3) build-javascript: Build JS and CSS chunks for production
//   4) build-html: build all HTML files

module.exports = async (
  program,
  directory,
  suppliedStage,
  webpackPort = 1500
) => {
  const directoryPath = withBasePath(directory)

  process.env.GATSBY_BUILD_STAGE = suppliedStage

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
    envObject.BUILD_STAGE = JSON.stringify(stage)

    const mergedEnvVars = Object.assign(envObject, gatsbyVarObject)

    return Object.keys(mergedEnvVars).reduce(
      (acc, key) => {
        acc[`process.env.${key}`] = mergedEnvVars[key]
        return acc
      },
      {
        "process.env": JSON.stringify({}),
      }
    )
  }

  function getHmrPath() {
    // ref: https://github.com/gatsbyjs/gatsby/issues/8348
    let hmrBasePath = `/`
    const hmrSuffix = `__webpack_hmr&reload=true&overlay=false`

    if (process.env.GATSBY_WEBPACK_PUBLICPATH) {
      const pubPath = process.env.GATSBY_WEBPACK_PUBLICPATH
      if (pubPath.substr(-1) === `/`) {
        hmrBasePath = pubPath
      } else {
        hmrBasePath = `${pubPath}/`
      }
    }

    return hmrBasePath + hmrSuffix
  }

  debug(`Loading webpack config for stage "${stage}"`)
  function getOutput() {
    switch (stage) {
      case `develop`:
        return {
          path: directory,
          filename: `[name].js`,
          // Add /* filename */ comments to generated require()s in the output.
          pathinfo: true,
          // Point sourcemap entries to original disk location (format as URL on Windows)
          publicPath: process.env.GATSBY_WEBPACK_PUBLICPATH || `/`,
          devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, `/`),
          // Avoid React cross-origin errors
          // See https://reactjs.org/docs/cross-origin-errors.html
          crossOriginLoading: `anonymous`,
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
          filename: `[name]-[contenthash].js`,
          chunkFilename: `[name]-[contenthash].js`,
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
            `${require.resolve(
              `webpack-hot-middleware/client`
            )}?path=${getHmrPath()}`,
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
      // optimizations for React) and what the link prefix is (__PATH_PREFIX__).
      plugins.define({
        ...processEnv(stage, `development`),
        __PATH_PREFIX__: JSON.stringify(
          program.prefixPaths ? store.getState().config.pathPrefix : ``
        ),
      }),
    ]

    switch (stage) {
      case `develop`:
        configPlugins = configPlugins.concat([
          plugins.hotModuleReplacement(),
          plugins.noEmitOnErrors(),

          new FriendlyErrorsWebpackPlugin({
            clearConsole: false,
          }),
        ])
        break
      case `build-javascript`: {
        configPlugins = configPlugins.concat([
          plugins.extractText(),
          // Write out stats object mapping named dynamic imports (aka page
          // components) to all their async chunks.
          plugins.extractStats(),
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
      rules.mjs(),
      rules.js(),
      rules.yaml(),
      rules.fonts(),
      rules.images(),
      rules.media(),
      rules.miscAssets(),
    ]
    switch (stage) {
      case `develop`: {
        // get schema to pass to eslint config and program for directory
        const { schema, program } = store.getState()

        // if no local eslint config, then add gatsby config
        if (!hasLocalEslint(program.directory)) {
          configRules = configRules.concat([rules.eslint(schema)])
        }

        configRules = configRules.concat([
          {
            oneOf: [rules.cssModules(), rules.css()],
          },
        ])

        break
      }
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
      alias: {
        gatsby$: directoryPath(path.join(`.cache`, `gatsby-browser-entry.js`)),
        // Using directories for module resolution is mandatory because
        // relative path imports are used sometimes
        // See https://stackoverflow.com/a/49455609/6420957 for more details
        "@babel/runtime": path.dirname(
          require.resolve(`@babel/runtime/package.json`)
        ),
        "core-js": path.dirname(require.resolve(`core-js/package.json`)),
        "react-hot-loader": path.dirname(
          require.resolve(`react-hot-loader/package.json`)
        ),
        "react-lifecycles-compat": directoryPath(
          `.cache/react-lifecycles-compat.js`
        ),
        "create-react-context": directoryPath(`.cache/create-react-context.js`),
      },
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
      minimizer: [
        // TODO: maybe this option should be noMinimize?
        !program.noUglify && plugins.minifyJs(),
        plugins.minifyCss(),
      ].filter(Boolean),
    }
  }

  if (stage === `build-html` || stage === `develop-html`) {
    const externalList = [
      // match `lodash` and `lodash/foo`
      // but not things like `lodash-es`
      `lodash`,
      /^lodash\//,
      `react`,
      /^react-dom\//,
      `pify`,
      `@reach/router`,
      `@reach/router/lib/history`,
      `common-tags`,
      `path`,
      `semver`,
      `react-helmet`,
      `minimatch`,
      `fs`,
      /^core-js\//,
      `es6-promise`,
      `crypto`,
      `zlib`,
      `http`,
      `https`,
      `debug`,
    ]

    config.externals = [
      function(context, request, callback) {
        if (
          externalList.some(item => {
            if (typeof item === `string` && item === request) {
              return true
            } else if (item instanceof RegExp && item.test(request)) {
              return true
            }

            return false
          })
        ) {
          return callback(null, `umd ${request}`)
        }
        return callback()
      },
    ]
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
