// @flow
const os = require(`os`)

const autoprefixer = require(`autoprefixer`)
const flexbugs = require(`postcss-flexbugs-fixes`)
const UglifyPlugin = require(`uglifyjs-webpack-plugin`)
const MiniCssExtractPlugin = require(`mini-css-extract-plugin`)

const builtinPlugins = require(`./webpack-plugins`)
const { createBabelConfig } = require(`./babel-config`)

type LoaderSpec = string | { loader: string, options?: Object }
type LoaderResolver<T: Object> = (options?: T) => LoaderSpec

type Condition = string | RegExp | RegExp[]

type Rule = {
  test?: Condition,
  use: LoaderSpec[],
  exclude?: Condition,
  include?: Condition,
}

type RuleFactory<T: Object> = (options?: T) => Rule

type ContextualRuleFactory = RuleFactory<*> & {
  internal: RuleFactory<*>,
  external: RuleFactory<*>,
}

type PluginInstance = any
type PluginFactory = (...args?: any) => PluginInstance

type BuiltinPlugins = typeof builtinPlugins

type Stage = "develop" | "develop-html" | "build-javascript" | "build-html"

/**
 * Configuration options for `createUtils`
 */
export type WebpackUtilsOptions = { stage: Stage, program: any }

/**
 * Utils that produce webpack `loader` objects
 */
export type LoaderUtils = {
  json: LoaderResolver<*>,
  yaml: LoaderResolver<*>,
  null: LoaderResolver<*>,
  raw: LoaderResolver<*>,

  style: LoaderResolver<*>,
  css: LoaderResolver<*>,
  postcss: LoaderResolver<{
    browsers?: string[],
    plugins?: Array<any> | ((loader: any) => Array<any>),
  }>,

  file: LoaderResolver<*>,
  url: LoaderResolver<*>,
  js: LoaderResolver<*>,

  imports: LoaderResolver<*>,
  exports: LoaderResolver<*>,
}

/**
 * Utils that prodcue webpack rule objects
 */
export type RuleUtils = {
  /**
   * Handles Javascript compilation via babel
   */
  js: RuleFactory<*>,
  yaml: RuleFactory<*>,
  fonts: RuleFactory<*>,
  images: RuleFactory<*>,
  audioVideo: RuleFactory<*>,

  css: ContextualRuleFactory,
  cssModules: RuleFactory<*>,
  postcss: ContextualRuleFactory,
}

export type PluginUtils = BuiltinPlugins & {
  extractText: PluginFactory,
  uglify: PluginFactory,
  moment: PluginFactory,
}

/**
 * webpack atoms namespace
 */
export type WebpackUtils = {
  loaders: LoaderUtils,

  rules: RuleUtils,

  plugins: PluginUtils,
}

/**
 * A factory method that produces an atoms namespace
 */
module.exports = async ({
  stage,
  program,
}: {
  stage: Stage,
  program: any,
}): Promise<WebpackUtilsOptions> => {
  const assetRelativeRoot = `static/`
  const vendorRegex = /(node_modules|bower_components)/
  const supportedBrowsers = program.browserlist

  const PRODUCTION = !stage.includes(`develop`)

  const babelConfig = await createBabelConfig(program, stage)

  const makeExternalOnly = (original: RuleFactory<*>) => (
    options = {}
  ): Rule => {
    let rule = original(options)
    rule.include = vendorRegex
    return rule
  }

  const makeInternalOnly = (original: RuleFactory<*>) => (
    options = {}
  ): Rule => {
    let rule = original(options)
    rule.exclude = vendorRegex
    return rule
  }

  let ident = 0

  const loaders: LoaderUtils = {
    json: (options = {}) => {
      return {
        options,
        loader: require.resolve(`json-loader`),
      }
    },

    yaml: (options = {}) => {
      return {
        options,
        loader: require.resolve(`yaml-loader`),
      }
    },

    null: (options = {}) => {
      return {
        options,
        loader: require.resolve(`null-loader`),
      }
    },

    raw: (options = {}) => {
      return {
        options,
        loader: require.resolve(`raw-loader`),
      }
    },

    style: (options = {}) => {
      return {
        options,
        loader: require.resolve(`style-loader`),
      }
    },

    css: (options = {}) => {
      return {
        loader: require.resolve(`css-loader`),
        options: {
          minimize: PRODUCTION,
          sourceMap: !PRODUCTION,
          camelCase: `dashesOnly`,
          // https://github.com/webpack-contrib/css-loader/issues/406
          localIdentName: `[name]--[local]--[hash:base64:5]`,
          ...options,
        },
      }
    },

    postcss: (options = {}) => {
      let { plugins, browsers = supportedBrowsers, ...postcssOpts } = options

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
          ...postcssOpts,
        },
      }
    },

    file: (options = {}) => {
      return {
        loader: require.resolve(`url-loader`),
        options: {
          name: `${assetRelativeRoot}[name]-[hash].[ext]`,
          ...options,
        },
      }
    },

    url: (options = {}) => {
      return {
        loader: require.resolve(`url-loader`),
        options: {
          limit: 10000,
          name: `${assetRelativeRoot}[name]-[hash].[ext]`,
          ...options,
        },
      }
    },

    js: (options = babelConfig) => {
      return {
        options,
        loader: require.resolve(`babel-loader`),
      }
    },

    imports: (options = {}) => {
      return {
        options,
        loader: require.resolve(`imports-loader`),
      }
    },

    exports: (options = {}) => {
      return {
        options,
        loader: require.resolve(`exports-loader`),
      }
    },
  }

  /**
   * Rules
   */
  const rules = {}

  /**
   * Javascript loader via babel, excludes node_modules
   */
  {
    let js = options => {
      return {
        test: /\.jsx?$/,
        exclude: vendorRegex,
        use: [loaders.js(options)],
      }
    }

    rules.js = js
  }

  rules.yaml = () => {
    return {
      test: /\.ya?ml/,
      use: [loaders.json(), loaders.yaml()],
    }
  }

  /**
   * Font loader
   */
  rules.fonts = () => {
    return {
      use: [loaders.url()],
      test: /\.(eot|otf|ttf|woff(2)?)(\?.*)?$/,
    }
  }

  /**
   * Loads image assets, inlines images via a data URI if they are below
   * the size threshold
   */
  rules.images = () => {
    return {
      use: [loaders.url()],
      test: /\.(ico|svg|jpg|jpeg|png|gif|webp)(\?.*)?$/,
    }
  }

  /**
   * Loads audio or video assets
   */
  rules.audioVideo = () => {
    return {
      use: [loaders.file()],
      test: /\.(mp4|webm|wav|mp3|m4a|aac|oga|flac)$/,
    }
  }

  /**
   * CSS style loader.
   */
  {
    const css = ({ browsers, ...options } = {}) => {
      return {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          loaders.css({ ...options, importLoaders: 1 }),
          loaders.postcss({ browsers }),
        ],
      }
    }

    /**
     * CSS style loader, _excludes_ node_modules.
     */
    css.internal = makeInternalOnly(css)
    css.external = makeExternalOnly(css)

    const cssModules = options => {
      const rule = css({ ...options, modules: true })
      delete rule.exclude
      rule.test = /\.module\.css$/
      return rule
    }

    rules.css = css
    rules.cssModules = cssModules
  }

  /**
   * PostCSS loader.
   */
  {
    const postcss = options => {
      return {
        test: /\.css$/,
        use: [loaders.css({ importLoaders: 1 }), loaders.postcss(options)],
      }
    }

    /**
     * PostCSS loader, _excludes_ node_modules.
     */
    postcss.internal = makeInternalOnly(postcss)
    postcss.external = makeExternalOnly(postcss)
    rules.postcss = postcss
  }
  /**
   * Plugins
   */
  const plugins = { ...builtinPlugins }

  /**
   * Minify javascript code without regard for IE8. Attempts
   * to parallelize the work to save time. Generally only add in Production
   */
  plugins.uglify = ({ uglifyOptions, ...options } = {}) =>
    new UglifyPlugin({
      cache: true,
      parallel: os.cpus().length - 1,
      exclude: /\.min\.js/,
      sourceMap: true,
      uglifyOptions: {
        compress: {
          drop_console: true,
        },
        ecma: 8,
        ie8: false,
        ...uglifyOptions,
      },
      ...options,
    })

  /**
   * Extracts css requires into a single file;
   * includes some reasonable defaults
   */
  plugins.extractText = options =>
    new MiniCssExtractPlugin({
      filename: `[name].[chunkhash].css`,
      chunkFilename: `[name].[chunkhash].css`,
      ...options,
    })

  plugins.moment = () => plugins.ignore(/^\.\/locale$/, /moment$/)

  return {
    loaders,
    rules: (rules: RuleUtils),
    plugins: (plugins: PluginUtils),
  }
}
