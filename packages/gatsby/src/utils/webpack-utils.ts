import { Loader, RuleSetRule, Plugin } from "webpack"
import { GraphQLSchema } from "graphql"
import autoprefixer from "autoprefixer"
import flexbugs from "postcss-flexbugs-fixes"
import TerserPlugin from "terser-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin"
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import isWsl from "is-wsl"
import { getBrowsersList } from "./browserslist"

import GatsbyWebpackStatsExtractor from "./gatsby-webpack-stats-extractor"
import GatsbyWebpackEslintGraphqlSchemaReload from "./gatsby-webpack-eslint-graphql-schema-reload-plugin"

import { builtinPlugins } from "./webpack-plugins"
import { IProgram, Stage } from "../commands/types"
import { eslintConfig } from "./eslint-config"

type LoaderResolver<T = {}> = (options?: T) => Loader

type LoaderOptions = Record<string, any>
type RuleFactory<T = {}> = (options?: T & LoaderOptions) => RuleSetRule

type ContextualRuleFactory<T = {}> = RuleFactory<T> & {
  internal?: RuleFactory<T>
  external?: RuleFactory<T>
}

type PluginFactory = (...args: any) => Plugin

type BuiltinPlugins = typeof builtinPlugins

/**
 * Utils that produce webpack `loader` objects
 */
interface ILoaderUtils {
  json: LoaderResolver
  yaml: LoaderResolver
  null: LoaderResolver
  raw: LoaderResolver

  style: LoaderResolver
  css: LoaderResolver
  postcss: LoaderResolver<{
    browsers?: string[]
    overrideBrowserslist?: string[]
    plugins?: Plugin[] | ((loader: Loader) => Plugin[])
  }>

  file: LoaderResolver
  url: LoaderResolver
  js: LoaderResolver
  dependencies: LoaderResolver

  miniCssExtract: LoaderResolver
  imports: LoaderResolver
  exports: LoaderResolver

  eslint(schema: GraphQLSchema): Loader
}

interface IModuleThatUseGatsby {
  name: string
  path: string
}

type CssLoaderModuleOption = boolean | Record<string, any> | string

/**
 * Utils that produce webpack rule objects
 */
interface IRuleUtils {
  /**
   * Handles JavaScript compilation via babel
   */
  js: RuleFactory<{ modulesThatUseGatsby?: IModuleThatUseGatsby[] }>
  dependencies: RuleFactory<{ modulesThatUseGatsby?: IModuleThatUseGatsby[] }>
  yaml: RuleFactory
  fonts: RuleFactory
  images: RuleFactory
  miscAssets: RuleFactory
  media: RuleFactory

  css: ContextualRuleFactory<{
    browsers?: string[]
    modules?: CssLoaderModuleOption
  }>
  cssModules: RuleFactory
  postcss: ContextualRuleFactory<{ overrideBrowserOptions: string[] }>

  eslint: (schema: GraphQLSchema) => RuleSetRule
}

type PluginUtils = BuiltinPlugins & {
  extractText: PluginFactory
  uglify: PluginFactory
  moment: PluginFactory
  extractStats: PluginFactory
  minifyJs: PluginFactory
  minifyCss: PluginFactory
  fastRefresh: PluginFactory
  eslintGraphqlSchemaReload: PluginFactory
}

/**
 * webpack atoms namespace
 */
interface IWebpackUtils {
  loaders: ILoaderUtils

  rules: IRuleUtils

  plugins: PluginUtils
}

/**
 * A factory method that produces an atoms namespace
 */
export const createWebpackUtils = (
  stage: Stage,
  program: IProgram
): IWebpackUtils => {
  const assetRelativeRoot = `static/`
  const vendorRegex = /(node_modules|bower_components)/
  const supportedBrowsers = getBrowsersList(program.directory)

  const PRODUCTION = !stage.includes(`develop`)

  const isSSR = stage.includes(`html`)

  const makeExternalOnly = (original: RuleFactory) => (
    options = {}
  ): RuleSetRule => {
    const rule = original(options)
    rule.include = vendorRegex
    return rule
  }

  const makeInternalOnly = (original: RuleFactory) => (
    options = {}
  ): RuleSetRule => {
    const rule = original(options)
    rule.exclude = vendorRegex
    return rule
  }

  let ident = 0

  const loaders: ILoaderUtils = {
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

    miniCssExtract: (options = {}) => {
      return {
        options,
        // use MiniCssExtractPlugin only on production builds
        loader: PRODUCTION
          ? MiniCssExtractPlugin.loader
          : require.resolve(`style-loader`),
      }
    },

    css: (options = {}) => {
      return {
        loader: isSSR
          ? require.resolve(`css-loader/locals`)
          : require.resolve(`css-loader`),
        options: {
          sourceMap: !PRODUCTION,
          camelCase: `dashesOnly`,
          // https://github.com/webpack-contrib/css-loader/issues/406
          localIdentName: `[name]--[local]--[hash:base64:5]`,
          ...options,
        },
      }
    },

    postcss: (options = {}) => {
      let {
        plugins,
        overrideBrowserslist = supportedBrowsers,
        ...postcssOpts
      } = options

      return {
        loader: require.resolve(`postcss-loader`),
        options: {
          ident: `postcss-${++ident}`,
          sourceMap: !PRODUCTION,
          plugins: (loader: Loader): Plugin[] => {
            plugins =
              (typeof plugins === `function` ? plugins(loader) : plugins) || []

            return [
              flexbugs,
              autoprefixer({ overrideBrowserslist, flexbox: `no-2009` }),
              ...plugins,
            ]
          },
          ...postcssOpts,
        },
      }
    },

    file: (options = {}) => {
      return {
        loader: require.resolve(`file-loader`),
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

    js: options => {
      return {
        options: {
          stage,
          ...options,
        },
        loader: require.resolve(`./babel-loader`),
      }
    },

    dependencies: options => {
      return {
        options,
        loader: require.resolve(`babel-loader`),
      }
    },

    eslint: (schema: GraphQLSchema) => {
      const options = eslintConfig(schema)

      return {
        options,
        loader: require.resolve(`eslint-loader`),
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
  const rules = {} as IRuleUtils

  /**
   * JavaScript loader via babel, includes userland code
   * and packages that depend on `gatsby`
   */
  {
    const js = ({
      modulesThatUseGatsby = [],
      ...options
    }: { modulesThatUseGatsby?: IModuleThatUseGatsby[] } = {}): RuleSetRule => {
      return {
        test: /\.(js|mjs|jsx)$/,
        include: (modulePath: string): boolean => {
          // when it's not coming from node_modules we treat it as a source file.
          if (!vendorRegex.test(modulePath)) {
            return true
          }

          // If the module uses Gatsby as a dependency
          // we want to treat it as src so we can extract queries
          return modulesThatUseGatsby.some(module =>
            modulePath.includes(module.path)
          )
        },
        type: `javascript/auto`,
        use: [
          loaders.js({
            ...options,
            configFile: true,
            compact: PRODUCTION,
          }),
        ],
      }
    }
    rules.js = js
  }

  /**
   * Node_modules JavaScript loader via babel
   * Excludes core-js & babel-runtime to speedup babel transpilation
   * Excludes modules that use Gatsby since the `rules.js` already transpiles those
   */
  {
    const dependencies = ({
      modulesThatUseGatsby = [],
    }: {
      modulesThatUseGatsby?: IModuleThatUseGatsby[]
    } = {}): RuleSetRule => {
      const jsOptions = {
        babelrc: false,
        configFile: false,
        compact: false,
        presets: [require.resolve(`babel-preset-gatsby/dependencies`)],
        // If an error happens in a package, it's possible to be
        // because it was compiled. Thus, we don't want the browser
        // debugger to show the original code. Instead, the code
        // being evaluated would be much more helpful.
        sourceMaps: false,
        cacheIdentifier: `${stage}---gatsby-dependencies@${
          require(`babel-preset-gatsby/package.json`).version
        }`,
      }

      return {
        test: /\.(js|mjs)$/,
        exclude: (modulePath: string): boolean => {
          if (vendorRegex.test(modulePath)) {
            // If dep uses Gatsby, exclude
            if (
              modulesThatUseGatsby.some(module =>
                modulePath.includes(module.path)
              )
            ) {
              return true
            }
            // If dep is babel-runtime or core-js, exclude
            if (/@babel(?:\/|\\{1,2})runtime|core-js/.test(modulePath)) {
              return true
            }

            // If dep is in node_modules and none of the above, include
            return false
          }

          // If dep is user land code, exclude
          return true
        },
        type: `javascript/auto`,
        use: [loaders.dependencies(jsOptions)],
      }
    }
    rules.dependencies = dependencies
  }

  rules.eslint = (schema: GraphQLSchema): RuleSetRule => {
    return {
      enforce: `pre`,
      test: /\.jsx?$/,
      exclude: vendorRegex,
      use: [loaders.eslint(schema)],
    }
  }

  rules.yaml = (): RuleSetRule => {
    return {
      test: /\.ya?ml/,
      use: [loaders.json(), loaders.yaml()],
    }
  }

  /**
   * Font loader
   */
  rules.fonts = (): RuleSetRule => {
    return {
      use: [loaders.url()],
      test: /\.(eot|otf|ttf|woff(2)?)(\?.*)?$/,
    }
  }

  /**
   * Loads image assets, inlines images via a data URI if they are below
   * the size threshold
   */
  rules.images = (): RuleSetRule => {
    return {
      use: [loaders.url()],
      test: /\.(ico|svg|jpg|jpeg|png|gif|webp)(\?.*)?$/,
    }
  }

  /**
   * Loads audio and video and inlines them via a data URI if they are below
   * the size threshold
   */
  rules.media = (): RuleSetRule => {
    return {
      use: [loaders.url()],
      test: /\.(mp4|webm|ogv|wav|mp3|m4a|aac|oga|flac)$/,
    }
  }

  /**
   * Loads assets without inlining
   */
  rules.miscAssets = (): RuleSetRule => {
    return {
      use: [loaders.file()],
      test: /\.pdf$/,
    }
  }

  /**
   * CSS style loader.
   */
  {
    const css: IRuleUtils["css"] = (options = {}): RuleSetRule => {
      const { browsers, ...restOptions } = options
      const use = [
        loaders.css({ ...restOptions, importLoaders: 1 }),
        loaders.postcss({ browsers }),
      ]
      if (!isSSR)
        use.unshift(
          loaders.miniCssExtract({ hmr: !PRODUCTION && !restOptions.modules })
        )

      return {
        use,
        test: /\.css$/,
      }
    }

    /**
     * CSS style loader, _excludes_ node_modules.
     */
    css.internal = makeInternalOnly(css)
    css.external = makeExternalOnly(css)

    const cssModules: IRuleUtils["cssModules"] = (options): RuleSetRule => {
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
    const postcss: ContextualRuleFactory = (options): RuleSetRule => {
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
   * cast rules to IRuleUtils
   */
  /**
   * Plugins
   */
  const plugins = { ...builtinPlugins } as PluginUtils

  /**
   * Minify JavaScript code without regard for IE8. Attempts
   * to parallelize the work to save time. Generally only add in Production
   */
  plugins.minifyJs = ({
    terserOptions,
    ...options
  }: { terserOptions?: TerserPlugin.TerserPluginOptions } = {}): Plugin =>
    new TerserPlugin({
      cache: true,
      // We can't use parallel in WSL because of https://github.com/gatsbyjs/gatsby/issues/6540
      // This issue was fixed in https://github.com/gatsbyjs/gatsby/pull/12636
      parallel: !isWsl,
      exclude: /\.min\.js/,
      sourceMap: true,
      terserOptions: {
        ie8: false,
        mangle: {
          safari10: true,
        },
        parse: {
          ecma: 8,
        },
        compress: {
          ecma: 5,
        },
        output: {
          ecma: 5,
        },
        ...terserOptions,
      },
      ...options,
    })

  plugins.minifyCss = (
    options = {
      cssProcessorPluginOptions: {
        preset: [
          `default`,
          {
            svgo: {
              full: true,
              plugins: [
                {
                  // potentially destructive plugins removed - see https://github.com/gatsbyjs/gatsby/issues/15629
                  // convertShapeToPath: true,
                  // removeViewBox: true,
                  removeUselessDefs: true,
                  addAttributesToSVGElement: true,
                  addClassesToSVGElement: true,
                  cleanupAttrs: true,
                  cleanupEnableBackground: true,
                  cleanupIDs: true,
                  cleanupListOfValues: true,
                  cleanupNumericValues: true,
                  collapseGroups: true,
                  convertColors: true,
                  convertPathData: true,
                  convertStyleToAttrs: true,
                  convertTransform: true,
                  inlineStyles: true,
                  mergePaths: true,
                  minifyStyles: true,
                  moveElemsAttrsToGroup: true,
                  moveGroupAttrsToElems: true,
                  prefixIds: true,
                  removeAttributesBySelector: true,
                  removeAttrs: true,
                  removeComments: true,
                  removeDesc: true,
                  removeDimensions: true,
                  removeDoctype: true,
                  removeEditorsNSData: true,
                  removeElementsByAttr: true,
                  removeEmptyAttrs: true,
                  removeEmptyContainers: true,
                  removeEmptyText: true,
                  removeHiddenElems: true,
                  removeMetadata: true,
                  removeNonInheritableGroupAttrs: true,
                  removeOffCanvasPaths: true,
                  removeRasterImages: true,
                  removeScriptElement: true,
                  removeStyleElement: true,
                  removeTitle: true,
                  removeUnknownsAndDefaults: true,
                  removeUnusedNS: true,
                  removeUselessStrokeAndFill: true,
                  removeXMLNS: true,
                  removeXMLProcInst: true,
                  reusePaths: true,
                  sortAttrs: true,
                },
              ],
            },
          },
        ],
      },
    }
  ): OptimizeCssAssetsPlugin => new OptimizeCssAssetsPlugin(options)

  plugins.fastRefresh = (): Plugin =>
    new ReactRefreshWebpackPlugin({
      disableRefreshCheck: true,
    })

  /**
   * Extracts css requires into a single file;
   * includes some reasonable defaults
   */
  plugins.extractText = (options: any): Plugin =>
    new MiniCssExtractPlugin({
      filename: `[name].[contenthash].css`,
      chunkFilename: `[name].[contenthash].css`,
      ...options,
    })

  plugins.moment = (): Plugin => plugins.ignore(/^\.\/locale$/, /moment$/)

  plugins.extractStats = (options: any): GatsbyWebpackStatsExtractor =>
    new GatsbyWebpackStatsExtractor(options)

  plugins.eslintGraphqlSchemaReload = (
    options
  ): GatsbyWebpackEslintGraphqlSchemaReload =>
    new GatsbyWebpackEslintGraphqlSchemaReload(options)

  return {
    loaders,
    rules,
    plugins,
  }
}
