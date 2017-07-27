const autoprefixer = require(`autoprefixer`)
const camelCase = require(`lodash/camelCase`)
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)
const flexbugs = require(`postcss-flexbugs-fixes`)
const webpack = require(`webpack`)

const genBabelConfig = require(`./babel-config`)

const VENDOR_MODULE_REGEX = /(node_modules|bower_components)/

module.exports = async ({ stage, program }) => {
  let configuration = {}

  const PRODUCTION = stage !== `develop`
  const DEFAULT_BROWSERS = program.browserlist

  const babelConfig = await genBabelConfig(program, stage)

  /**
   * Loaders
   */
  const loaders = (configuration.loaders = {})

  loaders.yaml = {
    loader: require.resolve(`yaml-loader`),
  }

  loaders.null = {
    loader: require.resolve(`null-loader`),
  }

  loaders.style = {
    loader: require.resolve(`style-loader`),
  }

  loaders.css = (opts = {}) => {
    return {
      loader: require.resolve(`css-loader`),
      options: {
        minimize: PRODUCTION,
        sourceMap: !PRODUCTION,
        camelCase: `dashesOnly`,
        // https://github.com/webpack-contrib/css-loader/issues/406
        localIdentName: `[name]--[local]--[hash:base64:5]`,
        ...opts,
      },
    }
  }

  let ident = 0
  loaders.postcss = (
    { plugins, browsers = DEFAULT_BROWSERS, ...rest } = {}
  ) => {
    return {
      loader: require.resolve(`postcss-loader`),
      options: {
        ident: `postcss-${++ident}`,
        sourceMap: !PRODUCTION,
        plugins: loader => {
          plugins =
            (typeof plugins === `function` ? plugins(loader) : plugins) || []

          return [
            flexbugs,
            autoprefixer({ browsers, flexbox: `no-2009` }),
            ...plugins,
          ]
        },
        ...rest,
      },
    }
  }

  loaders.file = options => ({
    loader: require.resolve(`file-loader`),
    options: {
      name: `static/[name]-[hash:*].[ext]`,
      ...options,
    },
  })

  loaders.url = options => ({
    loader: require.resolve(`url-loader`),
    options: {
      limit: 10000,
      name: `static/[name]-[hash:*].[ext]`,
      ...options,
    },
  })

  loaders.js = (options = babelConfig) => {
    return {
      options,
      loader: require.resolve(`babel-loader`),
    }
  }

  /**
   * Rules
   */
  const rules = (configuration.rules = {})

  rules.yaml = () => ({
    use: loaders.yaml,
    test: /\.ya?ml/,
  })

  /**
   * Javascript loader via babel, excludes node_modules
   */
  rules.js = options => ({
    test: /\.jsx?$/,
    exclude: VENDOR_MODULE_REGEX,
    use: loaders.js(options),
  })

  /**
   * Loads image assets, inlines images via a data URI if they are below
   * the size threshold
   */
  rules.images = options => ({
    use: loaders.url(options),
    test: /\.(svg|jpg|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
  })

  /**
   * Web font loader
   */
  rules.assets = options => ({
    use: loaders.file(options),
    test: /\.(ico|eot|otf|webp|ttf|woff(2)?)(\?.*)?$/,
  })

  /**
   * CSS style loader, excludes node_modules. Includes postCSS loader with
   * some useful default plugins such as Autoprefixer. Borrowed from CRA.
   */
  rules.css = ({ plugins, browsers = DEFAULT_BROWSERS, ...rest } = {}) => {
    return {
      test: /\.css$/,
      exclude: /\.module\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: loaders.style,
        use: [
          loaders.css({ ...rest, importLoaders: 1 }),
          loaders.postcss({ plugins, browsers }),
        ],
      }),
    }
  }

  /**
   * CSS style loader, _includes_ node_modules.
   */
  rules.cssModules = options => {
    const rule = rules.css({ ...options, modules: true })
    delete rule.exclude
    rule.test = /\.module\.css$/
    return rule
  }

  /**
   * Plugins
   */
  const plugins = (configuration.plugins = {})
  const pluginName = name => camelCase(name.replace(/Plugin$/, ``))

  // Re-export all the built-in plugins
  ;[
    `DefinePlugin`,
    `NormalModuleReplacementPlugin`,
    `ContextReplacementPlugin`,
    `IgnorePlugin`,
    `WatchIgnorePlugin`,
    `BannerPlugin`,
    `PrefetchPlugin`,
    `AutomaticPrefetchPlugin`,
    `ProvidePlugin`,
    `HotModuleReplacementPlugin`,
    `SourceMapDevToolPlugin`,
    `EvalSourceMapDevToolPlugin`,
    `EvalDevToolModulePlugin`,
    `CachePlugin`,
    `ExtendedAPIPlugin`,
    `ExternalsPlugin`,
    `JsonpTemplatePlugin`,
    `LibraryTemplatePlugin`,
    `LoaderTargetPlugin`,
    `MemoryOutputFileSystem`,
    `ProgressPlugin`,
    `SetVarMainTemplatePlugin`,
    `UmdMainTemplatePlugin`,
    `NoErrorsPlugin`,
    `NoEmitOnErrorsPlugin`,
    `NewWatchingPlugin`,
    `EnvironmentPlugin`,
    `DllPlugin`,
    `DllReferencePlugin`,
    `LoaderOptionsPlugin`,
    `NamedModulesPlugin`,
    `NamedChunksPlugin`,
    `HashedModuleIdsPlugin`,
    `ModuleFilenameHelpers`,
  ].forEach(plugin => {
    plugins[pluginName(plugin)] = (...args) => new webpack[plugin](...args)
  })
  ;[
    `AggressiveMergingPlugin`,
    `AggressiveSplittingPlugin`,
    `CommonsChunkPlugin`,
    `ChunkModuleIdRangePlugin`,
    `DedupePlugin`,
    `LimitChunkCountPlugin`,
    `MinChunkSizePlugin`,
    `OccurrenceOrderPlugin`,
    //`UglifyJsPlugin`
  ].forEach(plugin => {
    plugins[pluginName(plugin)] = (...args) =>
      new webpack.optimize[plugin](...args)
  })

  /**
   * The webpack2 shim plugin for passing options to loaders. Sets
   * the minize and debug options to `true` in production (used by various loaders)
   */
  plugins.loaderOptions = options =>
    new webpack.LoaderOptionsPlugin({
      options,
      minimize: PRODUCTION,
      debug: !PRODUCTION,
    })

  /**
   * Minify javascript code without regard for IE8. Attempts
   * to parallelize the work to save time. Generally only add in Production
   */
  plugins.uglify = () =>
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
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
    })

  /**
   * Extracts css requires into a single file;
   * includes some reasonable defaults
   */
  plugins.extractText = options =>
    new ExtractTextPlugin({
      allChunks: true,

      // Useful when using css modules, it assert a dependency order for how
      // css is concated together. AS it is the default heuristic for ordering
      // is require() order, but that is rarely indicative of the proper cascade
      // order for component css files, and will cause issues when using "helper"
      // files containing a lot of small composable classes
      ignoreOrder: true,

      // The extracted css is not needed for stage other than `build-css`
      // but we extract at all build stages to avoid:
      //  - adding extra weight to the js bundle in `build-javascript`
      //  - errors in `build-html` caused by style-loader assuming a DOM exists
      //
      // TODO: these extra passes are costly on time and can be
      // fixed in more optimal ways
      disable: stage === `develop` || stage === `develop-html`,
,
      ...options,
    })

  plugins.extractText.extract = (...args) => ExtractTextPlugin.extract(...args)

  // Moment.js includes 100s of KBs of extra localization data by
  // default in Webpack that most sites don`t want. This line disables
  // loading locale modules. This is a practical solution that requires
  // the user to opt into importing specific locales.
  // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
  plugins.moment = () => new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)

  return configuration
}
