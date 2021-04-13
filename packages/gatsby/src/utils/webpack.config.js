require(`v8-compile-cache`)

const { isCI } = require(`gatsby-core-utils`)
const crypto = require(`crypto`)
const fs = require(`fs-extra`)
const path = require(`path`)
const dotenv = require(`dotenv`)
const { CoreJSResolver } = require(`./webpack/corejs-resolver`)
const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)
const { getPublicPath } = require(`./get-public-path`)
const debug = require(`debug`)(`gatsby:webpack-config`)
const report = require(`gatsby-cli/lib/reporter`)
import { withBasePath, withTrailingSlash } from "./path"
import { getGatsbyDependents } from "./gatsby-dependents"
const apiRunnerNode = require(`./api-runner-node`)
import { createWebpackUtils } from "./webpack-utils"
import { hasLocalEslint } from "./local-eslint-config-finder"
import { getAbsolutePathForVirtualModule } from "./gatsby-webpack-virtual-modules"
import { StaticQueryMapper } from "./webpack/static-query-mapper"
import { ForceCssHMRForEdgeCases } from "./webpack/force-css-hmr-for-edge-cases"
import { getBrowsersList } from "./browserslist"
import { builtinModules } from "module"
const { BabelConfigItemsCacheInvalidatorPlugin } = require(`./babel-loader`)

const FRAMEWORK_BUNDLES = [`react`, `react-dom`, `scheduler`, `prop-types`]

// Four stages or modes:
//   1) develop: for `gatsby develop` command, hot reload and CSS injection into page
//   2) develop-html: same as develop without react-hmre in the babel config for html renderer
//   3) build-javascript: Build JS and CSS chunks for production
//   4) build-html: build all HTML files

module.exports = async (
  program,
  directory,
  suppliedStage,
  port,
  { parentSpan } = {}
) => {
  const modulesThatUseGatsby = await getGatsbyDependents()
  const directoryPath = withBasePath(directory)

  process.env.GATSBY_BUILD_STAGE = suppliedStage

  // We combine develop & develop-html stages for purposes of generating the
  // webpack config.
  const stage = suppliedStage
  const { rules, loaders, plugins } = createWebpackUtils(stage, program)

  const { assetPrefix, pathPrefix } = store.getState().config

  const publicPath = getPublicPath({ assetPrefix, pathPrefix, ...program })

  function processEnv(stage, defaultNodeEnv) {
    debug(`Building env for "${stage}"`)
    // node env should be DEVELOPMENT | PRODUCTION as these are commonly used in node land
    // this variable is used inside webpack
    const nodeEnv = process.env.NODE_ENV || `${defaultNodeEnv}`
    // config env is dependent on the env that it's run, this can be anything from staging-production
    // this allows you to set use different .env environments or conditions in gatsby files
    const configEnv = process.env.GATSBY_ACTIVE_ENV || nodeEnv
    const envFile = path.join(process.cwd(), `./.env.${configEnv}`)
    let parsed = {}
    try {
      parsed = dotenv.parse(fs.readFileSync(envFile, { encoding: `utf8` }))
    } catch (err) {
      if (err.code !== `ENOENT`) {
        report.error(
          `There was a problem processing the .env file (${envFile})`,
          err
        )
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
    envObject.NODE_ENV = JSON.stringify(nodeEnv)
    envObject.PUBLIC_DIR = JSON.stringify(`${process.cwd()}/public`)
    envObject.BUILD_STAGE = JSON.stringify(stage)
    envObject.CYPRESS_SUPPORT = JSON.stringify(process.env.CYPRESS_SUPPORT)
    envObject.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND = JSON.stringify(
      !!process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND
    )

    if (stage === `develop`) {
      envObject.GATSBY_SOCKET_IO_DEFAULT_TRANSPORT = JSON.stringify(
        process.env.GATSBY_SOCKET_IO_DEFAULT_TRANSPORT || `websocket`
      )
    }

    const mergedEnvVars = Object.assign(envObject, gatsbyVarObject)

    return Object.keys(mergedEnvVars).reduce(
      (acc, key) => {
        acc[`process.env.${key}`] = mergedEnvVars[key]
        return acc
      },
      {
        "process.env": `({})`,
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
        hmrBasePath = withTrailingSlash(pubPath)
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
        // Generate the file needed to SSR pages.
        // Deleted by build-html.js, since it's not needed for production.
        return {
          path: directoryPath(`public`),
          filename: `render-page.js`,
          libraryTarget: `commonjs`,
          publicPath: withTrailingSlash(publicPath),
        }
      case `build-javascript`:
        return {
          filename: `[name]-[contenthash].js`,
          chunkFilename: `[name]-[contenthash].js`,
          path: directoryPath(`public`),
          publicPath: withTrailingSlash(publicPath),
        }
      default:
        throw new Error(`The state requested ${stage} doesn't exist.`)
    }
  }

  function getEntry() {
    switch (stage) {
      case `develop`:
        return {
          polyfill: directoryPath(`.cache/polyfill-entry`),
          commons: [directoryPath(`.cache/app`)],
        }
      case `develop-html`:
        return {
          main: process.env.GATSBY_EXPERIMENTAL_DEV_SSR
            ? directoryPath(`.cache/ssr-develop-static-entry`)
            : directoryPath(`.cache/develop-static-entry`),
        }
      case `build-html`:
        return {
          main: directoryPath(`.cache/static-entry`),
        }
      case `build-javascript`:
        return {
          polyfill: directoryPath(`.cache/polyfill-entry`),
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
        __BASE_PATH__: JSON.stringify(program.prefixPaths ? pathPrefix : ``),
        __PATH_PREFIX__: JSON.stringify(program.prefixPaths ? publicPath : ``),
        __ASSET_PREFIX__: JSON.stringify(
          program.prefixPaths ? assetPrefix : ``
        ),
      }),

      plugins.virtualModules(),
      new BabelConfigItemsCacheInvalidatorPlugin(),
    ]

    switch (stage) {
      case `develop`: {
        configPlugins = configPlugins
          .concat([
            plugins.fastRefresh({ modulesThatUseGatsby }),
            new ForceCssHMRForEdgeCases(),
            plugins.hotModuleReplacement(),
            plugins.noEmitOnErrors(),
            plugins.eslintGraphqlSchemaReload(),
            new StaticQueryMapper(store),
          ])
          .filter(Boolean)

        configPlugins.push(
          plugins.extractText({
            filename: `[name].css`,
            chunkFilename: `[id].css`,
          })
        )

        if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
          configPlugins.push(plugins.extractStats())
        }

        const isCustomEslint = hasLocalEslint(program.directory)
        // get schema to pass to eslint config and program for directory
        const { schema } = store.getState()

        // if no local eslint config, then add gatsby config
        if (!isCustomEslint) {
          configPlugins.push(plugins.eslint(schema))
        }

        // Enforce fast-refresh rules even with local eslint config
        if (isCustomEslint) {
          configPlugins.push(plugins.eslintRequired())
        }

        break
      }
      case `build-javascript`: {
        configPlugins = configPlugins.concat([
          plugins.extractText({
            filename: `[name].[contenthash].css`,
            chunkFilename: `[name].[contenthash].css`,
          }),
          // Write out stats object mapping named dynamic imports (aka page
          // components) to all their async chunks.
          plugins.extractStats(),
          new StaticQueryMapper(store),
        ])
        break
      }
    }

    return configPlugins
  }

  function getDevtool() {
    switch (stage) {
      case `develop`:
        return `eval-cheap-module-source-map`
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

  function getModule() {
    // Common config for every env.
    // prettier-ignore
    let configRules = [
      // Webpack expects extensions when importing ESM modules as that's what the spec describes.
      // Not all libraries have adapted so we don't enforce its behaviour
      // @see https://github.com/webpack/webpack/issues/11467
      {
        test: /\.mjs$/i,
        resolve: {
          byDependency: {
            esm: {
              fullySpecified: false
            }
          }
        }
      },
      {
        test: /\.js$/i,
        descriptionData: {
          type: `module`
        },
        resolve: {
          byDependency: {
            esm: {
              fullySpecified: false
            }
          }
        }
      },
      rules.js({
        modulesThatUseGatsby,
      }),
      rules.yaml(),
      rules.fonts(),
      rules.images(),
      rules.media(),
      rules.miscAssets(),

      // This is a hack that exports one of @reach/router internals (BaseContext)
      // to export list. We need it to reset basepath and baseuri context after
      // Gatsby main router changes it, to keep v2 behaviour.
      // We will need to most likely remove this for v3.
      {
        test: require.resolve(`@gatsbyjs/reach-router/es/index`),
        type: `javascript/auto`,
        use: [{
          loader: require.resolve(`./reach-router-add-basecontext-export-loader`),
        }],
      }
    ]

    // Speedup 🏎️💨 the build! We only include transpilation of node_modules on javascript production builds
    // TODO create gatsby plugin to enable this behaviour on develop (only when people are requesting this feature)
    if (stage === `build-javascript`) {
      configRules.push(
        rules.dependencies({
          modulesThatUseGatsby,
        })
      )
    }

    switch (stage) {
      case `develop`: {
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

  function getPackageRoot(pkg) {
    return path.dirname(require.resolve(`${pkg}/package.json`))
  }

  function getResolve(stage) {
    const { program } = store.getState()
    const resolve = {
      // Use the program's extension list (generated via the
      // 'resolvableExtensions' API hook).
      extensions: [...program.extensions],
      alias: {
        gatsby$: directoryPath(path.join(`.cache`, `gatsby-browser-entry.js`)),
        // Using directories for module resolution is mandatory because
        // relative path imports are used sometimes
        // See https://stackoverflow.com/a/49455609/6420957 for more details
        "@babel/runtime": getPackageRoot(`@babel/runtime`),
        "@reach/router": getPackageRoot(`@gatsbyjs/reach-router`),
        "react-lifecycles-compat": directoryPath(
          `.cache/react-lifecycles-compat.js`
        ),
        "@pmmmwh/react-refresh-webpack-plugin": getPackageRoot(
          `@pmmmwh/react-refresh-webpack-plugin`
        ),
        "socket.io-client": getPackageRoot(`socket.io-client`),
        "webpack-hot-middleware": getPackageRoot(
          `@gatsbyjs/webpack-hot-middleware`
        ),
        $virtual: getAbsolutePathForVirtualModule(`$virtual`),

        // SSR can have many react versions as some packages use their own version. React works best with 1 version.
        // By resolving react,react-dom from gatsby we'll get the site versions of react & react-dom because it's specified as a peerdependency.
        react: getPackageRoot(`react`),
        "react-dom": getPackageRoot(`react-dom`),
      },
      plugins: [new CoreJSResolver()],
    }

    const target =
      stage === `build-html` || stage === `develop-html` ? `node` : `web`
    if (target === `web`) {
      resolve.alias[`@reach/router`] = path.join(
        getPackageRoot(`@gatsbyjs/reach-router`),
        `es`
      )
    }

    if (stage === `build-javascript` && program.profile) {
      resolve.alias[`react-dom$`] = `react-dom/profiling`
      resolve.alias[`scheduler/tracing`] = `scheduler/tracing-profiling`
    }
    return resolve
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

    devtool: getDevtool(),
    // Turn off performance hints as we (for now) don't want to show the normal
    // webpack output anywhere.
    performance: {
      hints: false,
    },
    mode: getMode(),

    resolveLoader: getResolveLoader(),
    resolve: getResolve(stage),
  }

  if (stage === `build-html` || stage === `develop-html`) {
    const [major, minor] = process.version.replace(`v`, ``).split(`.`)
    config.target = `node12.13`
  } else {
    config.target = [`web`, `es5`]
  }

  const isCssModule = module => module.type === `css/mini-extract`
  if (stage === `develop`) {
    config.optimization = {
      splitChunks: {
        chunks: `all`,
        cacheGroups: {
          default: false,
          defaultVendors: false,
          framework: {
            chunks: `all`,
            name: `framework`,
            // This regex ignores nested copies of framework libraries so they're bundled with their issuer.
            test: new RegExp(
              `(?<!node_modules.*)[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join(
                `|`
              )})[\\\\/]`
            ),
            priority: 40,
            // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
            enforce: true,
          },
          // Bundle all css & lazy css into one stylesheet to make sure lazy components do not break
          // TODO make an exception for css-modules
          styles: {
            test(module) {
              return isCssModule(module)
            },

            name: `commons`,
            priority: 40,
            enforce: true,
          },
        },
      },
      minimizer: [],
    }
  }

  if (stage === `build-javascript`) {
    const componentsCount = store.getState().components.size

    const splitChunks = {
      chunks: `all`,
      cacheGroups: {
        default: false,
        defaultVendors: false,
        framework: {
          chunks: `all`,
          name: `framework`,
          // This regex ignores nested copies of framework libraries so they're bundled with their issuer.
          test: new RegExp(
            `(?<!node_modules.*)[\\\\/]node_modules[\\\\/](${FRAMEWORK_BUNDLES.join(
              `|`
            )})[\\\\/]`
          ),
          priority: 40,
          // Don't let webpack eliminate this chunk (prevents this chunk from becoming a part of the commons chunk)
          enforce: true,
        },
        // if a module is bigger than 160kb from node_modules we make a separate chunk for it
        lib: {
          test(module) {
            return (
              !isCssModule(module) &&
              module.size() > 160000 &&
              /node_modules[/\\]/.test(module.identifier())
            )
          },
          name(module) {
            const hash = crypto.createHash(`sha1`)
            if (!module.libIdent) {
              throw new Error(
                `Encountered unknown module type: ${module.type}. Please open an issue.`
              )
            }

            hash.update(module.libIdent({ context: program.directory }))

            return hash.digest(`hex`).substring(0, 8)
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true,
        },
        commons: {
          name: `commons`,
          // if a chunk is used on all components we put it in commons (we need at least 2 components)
          minChunks: Math.max(componentsCount, 2),
          priority: 20,
        },
        // If a chunk is used in at least 2 components we create a separate chunk
        shared: {
          test(module) {
            return !isCssModule(module)
          },
          name(module, chunks) {
            const hash = crypto
              .createHash(`sha1`)
              .update(chunks.reduce((acc, chunk) => acc + chunk.name, ``))
              .digest(`hex`)

            return hash
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true,
        },

        // Bundle all css & lazy css into one stylesheet to make sure lazy components do not break
        // TODO make an exception for css-modules
        styles: {
          test(module) {
            return isCssModule(module)
          },

          name: `styles`,
          priority: 40,
          enforce: true,
        },
      },
      // We load our pages async through async-requires, maxInitialRequests doesn't have an effect on chunks derived from page components.
      // By default webpack has set maxAsyncRequests to 6, in some cases this isn't enough an actually makes the bundle size blow up.
      // We've set maxAsyncRequests to Infinity to negate this. This could potentionally exceed the 25 initial requests that we set before
      // sadly I do not have a better solution.
      maxAsyncRequests: Infinity,
      maxInitialRequests: 25,
      minSize: 20000,
    }

    config.optimization = {
      runtimeChunk: {
        name: `webpack-runtime`,
      },
      splitChunks,
      minimizer: [
        // TODO: maybe this option should be noMinimize?
        !program.noUglify &&
          plugins.minifyJs(
            program.profile
              ? {
                  terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                  },
                }
              : {}
          ),
        plugins.minifyCss(),
      ].filter(Boolean),
    }
  }

  if (stage === `build-html` || stage === `develop-html`) {
    // removes node internals from bundle
    // https://webpack.js.org/configuration/externals/#externalspresets
    config.externalsPresets = {
      node: stage === `build-html` ? false : true,
    }

    // Packages we want to externalize to save some build time
    // https://github.com/gatsbyjs/gatsby/pull/14208#pullrequestreview-240178728
    // const externalList = [`common-tags`, `lodash`, `semver`, /^lodash\//]

    // Packages we want to externalize because meant to be user-provided
    const userExternalList = [`react`, /^react-dom\//]

    const checkItem = (item, request) => {
      if (typeof item === `string` && item === request) {
        return true
      } else if (item instanceof RegExp && item.test(request)) {
        return true
      }

      return false
    }

    config.externals = [
      function ({ context, getResolve, request }, callback) {
        // allows us to resolve webpack aliases from our config
        // helpful for when react is aliased to preact-compat
        // Force commonjs as we're in node land
        const resolver = getResolve({
          dependencyType: `commonjs`,
        })

        // User modules that do not need to be part of the bundle
        if (userExternalList.some(item => checkItem(item, request))) {
          // TODO figure out to make preact work with this too

          resolver(context, request, (err, newRequest) => {
            if (err) {
              callback(err)
              return
            }

            callback(null, newRequest)
          })
          return
        }
        // TODO look into re-enabling, breaks builds right now because of esm
        // User modules that do not need to be part of the bundle
        // if (externalList.some(item => checkItem(item, request))) {
        //   resolver(context, request, (err, request) => {
        //     if (err) {
        //       callback(err)
        //       return
        //     }

        //     callback(null, `commonjs2 ${request}`)
        //   })
        //   return
        // }

        callback()
      },
    ]

    if (stage === `build-html`) {
      const builtinModulesToTrack = [
        `fs`,
        `http`,
        `http2`,
        `https`,
        `child_process`,
      ]
      const builtinsExternalsDictionary = builtinModules.reduce(
        (acc, builtinModule) => {
          if (builtinModulesToTrack.includes(builtinModule)) {
            acc[builtinModule] = `commonjs ${path.join(
              program.directory,
              `.cache`,
              `ssr-builtin-trackers`,
              builtinModule
            )}`
          } else {
            acc[builtinModule] = `commonjs ${builtinModule}`
          }
          return acc
        },
        {}
      )

      config.externals.unshift(builtinsExternalsDictionary)
    }
  }

  if (stage === `develop`) {
    config.externals = {
      "socket.io-client": `io`,
    }
  }

  if (stage === `build-javascript` || stage === `build-html`) {
    const cacheLocation = path.join(
      program.directory,
      `.cache`,
      `webpack`,
      `stage-` + stage
    )

    fs.ensureDirSync(cacheLocation)

    const cacheConfig = {
      type: `filesystem`,
      name: stage,
      cacheLocation,
      buildDependencies: {
        config: [
          __filename,
          ...store
            .getState()
            .flattenedPlugins.filter(plugin =>
              plugin.nodeAPIs.includes(`onCreateWebpackConfig`)
            )
            .map(plugin => path.join(plugin.resolve, `gatsby-node.js`)),
        ],
      },
    }

    console.log(cacheConfig)

    config.cache = cacheConfig
  }

  store.dispatch(actions.replaceWebpackConfig(config))
  const getConfig = () => store.getState().webpack

  await apiRunnerNode(`onCreateWebpackConfig`, {
    getConfig,
    stage,
    rules,
    loaders,
    plugins,
    parentSpan,
  })

  return getConfig()
}
