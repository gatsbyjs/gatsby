// @flow

const autoprefixer = require(`autoprefixer`)
const camelCase = require(`lodash/camelCase`)
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)
const flexbugs = require(`postcss-flexbugs-fixes`)
const webpack = require(`webpack`)

const genBabelConfig = require(`./babel-config`)

const VENDOR_MODULE_REGEX = /(node_modules|bower_components)/

type Stage = 'develop' | 'develop-html' | 'build-css' | 'build-html' | 'build-javascript';

type LoaderSpec  = string | { loader: string, options?: Object };
type LoaderResolver = (options: Object) => LoaderSpec;

type Rule = {
  test: RegExp,
  use: LoaderSpec | LoaderSpec[],
  exclude?: RegExp,
  include?: RegExp,
};

type PluginInstance = Object;

type WebpackConfigUtils = {
  loaders: {|
    json: LoaderSpec,
    yaml: LoaderSpec,
    null: LoaderSpec,
    file: LoaderResolver,
    url: LoaderResolver,

    style: LoaderSpec,
    css: LoaderResolver,
    postcss: (options: {
      browsers: string[],
      plugins: Array<any> | (loader: any) => Array<any>,
    }) => LoaderSpec,

    js: LoaderResolver,
  |},

  rules: {|
    yaml: () => Rule,
    js: (options: Object) => Rule,
    images: (options: Object) => Rule,
    assets: (options: Object) => Rule,
    css: (options: Object) => Rule,
    cssModules: (options: Object) => Rule,
  |},

  plugins: {
    uglify: (options: Object) => PluginInstance,
    loaderOptions: (options: Object) => PluginInstance,
    extractText: (options: Object) => PluginInstance,
    moment: (options: Object) => PluginInstance,
  }
};

module.exports = async (
  {
    stage,
    program,
  }: { stage: Stage, program: any }
): Promise<WebpackConfigUtils> => {
  const PRODUCTION = !stage.includes(`develop`)
  const DEFAULT_BROWSERS = program.browserlist

  const babelConfig = await genBabelConfig(program, stage)
  let ident = 0

  /**
   * Loaders
   */
  const loaders = {
    json: {
      loader: require.resolve(`json-loader`),
    },

    yaml: {
      loader: require.resolve(`yaml-loader`),
    },

    null: {
      loader: require.resolve(`null-loader`),
    },

    style: {
      loader: require.resolve(`style-loader`),
    },

    css: (opts = {}) => {
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
    },

    postcss: ({
      plugins,
      browsers = DEFAULT_BROWSERS,
      ...rest
    } = {}) => {
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
    },

    file: options => {return {
      loader: require.resolve(`file-loader`),
      options: {
        name: `static/[name]-[hash:*].[ext]`,
        ...options,
      },
    }},

    url: options => {return {
      loader: require.resolve(`url-loader`),
      options: {
        limit: 10000,
        name: `static/[name]-[hash:*].[ext]`,
        ...options,
      },
    }},

    js: (options = babelConfig) => {
      return {
        options,
        loader: require.resolve(`babel-loader`),
      }
    },
  }

  /**
   * Rules
   */
  const rules = {
    yaml: () => {return {
      test: /\.ya?ml/,
      use: [loaders.json, loaders.yaml],
    }},

    /**
     * Javascript loader via babel, excludes node_modules
     *
     * @param {object=} options Options passed to babel-loader
     */
    js: options => {return {
      test: /\.jsx?$/,
      exclude: VENDOR_MODULE_REGEX,
      use: loaders.js(options),
    }},

    /**
     * Loads image assets, inlines images via a data URI if they are below
     * the size threshold
     */
    images: options => {return {
      use: loaders.url(options),
      test: /\.(svg|jpg|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
    }},

    /**
     * Web font loader
     */
    assets: options => {return {
      use: loaders.file(options),
      test: /\.(ico|eot|otf|webp|ttf|woff(2)?)(\?.*)?$/,
    }},

    /**
     * CSS style loader, excludes node_modules. Includes postCSS loader with
     * some useful default plugins such as Autoprefixer. Borrowed from CRA.
     */
    css: ({ plugins, browsers = DEFAULT_BROWSERS, ...rest } = {}) => {
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
    },

    /**
     * CSS style loader, _includes_ node_modules.
     */
    cssModules: options => {
      const rule = rules.css({ ...options, modules: true })
      delete rule.exclude
      rule.test = /\.module\.css$/
      return rule
    },
  }

  const pluginName = name => camelCase(name.replace(/Plugin$/, ``))

  const plugins = {
    /**
     * Minify javascript code without regard for IE8. Attempts
     * to parallelize the work to save time. Generally only add in Production
     */
    uglify: () =>
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
      }),

   /**
    * The webpack2 shim plugin for passing options to loaders. Sets
    * the minize and debug options to `true` in production (used by various loaders)
    */
    loaderOptions: options =>
      new webpack.LoaderOptionsPlugin({
        options,
        minimize: PRODUCTION,
        debug: !PRODUCTION,
      }),

    /**
     * Extracts css requires into a single file;
     * includes some reasonable defaults
     */
    extractText: options =>
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

        ...options,
      }),



    // Moment.js includes 100s of KBs of extra localization data by
    // default in Webpack that most sites don`t want. This line disables
    // loading locale modules. This is a practical solution that requires
    // the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    moment: () => new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  }

  plugins.extractText.extract = (...args) => ExtractTextPlugin.extract(...args)


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
    if (!plugins[pluginName(plugin)])
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
    if (!plugins[pluginName(plugin)])
      plugins[pluginName(plugin)] = (...args) =>
        new webpack.optimize[plugin](...args)
  })


  return {
    loaders,
    rules,

    /**
     * Common and core webpack plugins. All core webpack plugins are reexported as
     * function factories, where the name is camelCased without the trailing "Plugin".
     *
     * So `new webpack.CommonsChunkPlugin(...)` becomes -> `plugins.commonsChunk(...)`
     *
     * @example
     *
     *   plugins.define({ DEV: true })
     */
    plugins,
  }
}
