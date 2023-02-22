import * as path from "path"
import { RuleSetRule, WebpackPluginInstance } from "webpack"
import { GraphQLSchema } from "graphql"
import { Plugin as PostCSSPlugin } from "postcss"
import autoprefixer from "autoprefixer"
import flexbugs from "postcss-flexbugs-fixes"
import TerserPlugin from "terser-webpack-plugin"
import type { MinifyOptions as TerserOptions } from "terser"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import CssMinimizerPlugin from "css-minimizer-webpack-plugin"
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import { getBrowsersList } from "./browserslist"
import ESLintPlugin from "eslint-webpack-plugin"
import { cpuCoreCount } from "gatsby-core-utils"
import { GatsbyWebpackStatsExtractor } from "./gatsby-webpack-stats-extractor"
import { getPublicPath } from "./get-public-path"
import {
  GatsbyWebpackVirtualModules,
  VIRTUAL_MODULES_BASE_PATH,
} from "./gatsby-webpack-virtual-modules"

import { builtinPlugins } from "./webpack-plugins"
import { IProgram, Stage } from "../commands/types"
import { eslintConfig, eslintRequiredConfig } from "./eslint-config"
import { store } from "../redux"
import type { RuleSetUseItem } from "webpack"
import { ROUTES_DIRECTORY } from "../constants"

type Loader = string | { loader: string; options?: { [name: string]: any } }
type LoaderResolver<T = Record<string, unknown>> = (options?: T) => Loader

type LoaderOptions = Record<string, any>
type RuleFactory<T = Record<string, unknown>> = (
  options?: T & LoaderOptions
) => RuleSetRule

type ContextualRuleFactory<T = Record<string, unknown>> = RuleFactory<T> & {
  internal?: RuleFactory<T>
  external?: RuleFactory<T>
}

type PluginFactory = (...args: any) => WebpackPluginInstance | null

type BuiltinPlugins = typeof builtinPlugins

type CSSModulesOptions =
  | boolean
  | string
  | {
      mode?:
        | "local"
        | "global"
        | "pure"
        | ((resourcePath: string) => "local" | "global" | "pure")
      auto?: boolean
      exportGlobals?: boolean
      localIdentName?: string
      localIdentContext?: string
      localIdentHashPrefix?: string
      namedExport?: boolean
      exportLocalsConvention?:
        | "asIs"
        | "camelCaseOnly"
        | "camelCase"
        | "dashes"
        | "dashesOnly"
      exportOnlyLocals?: boolean
    }

type MiniCSSExtractLoaderModuleOptions =
  | undefined
  | boolean
  | {
      namedExport?: boolean
    }
/**
 * Utils that produce webpack `loader` objects
 */
interface ILoaderUtils {
  yaml: LoaderResolver
  style: LoaderResolver
  css: LoaderResolver<{
    url?: boolean | ((url: string, resourcePath: string) => boolean)
    import?:
      | boolean
      | ((url: string, media: string, resourcePath: string) => boolean)
    modules?: CSSModulesOptions
    sourceMap?: boolean
    importLoaders?: number
    esModule?: boolean
  }>
  postcss: LoaderResolver<{
    browsers?: Array<string>
    overrideBrowserslist?: Array<string>
    plugins?: Array<PostCSSPlugin> | ((loader: Loader) => Array<PostCSSPlugin>)
  }>

  file: LoaderResolver
  url: LoaderResolver
  js: LoaderResolver
  json: LoaderResolver
  null: LoaderResolver
  raw: LoaderResolver
  dependencies: LoaderResolver

  miniCssExtract: LoaderResolver
  imports?: LoaderResolver
  exports?: LoaderResolver
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
  js: RuleFactory<{ modulesThatUseGatsby?: Array<IModuleThatUseGatsby> }>
  dependencies: RuleFactory<{
    modulesThatUseGatsby?: Array<IModuleThatUseGatsby>
  }>
  yaml: RuleFactory
  fonts: RuleFactory
  images: RuleFactory
  miscAssets: RuleFactory
  media: RuleFactory

  css: ContextualRuleFactory<{
    browsers?: Array<string>
    modules?: CssLoaderModuleOption
  }>
  cssModules: RuleFactory
  postcss: ContextualRuleFactory<{ overrideBrowserOptions: Array<string> }>

  eslint: (schema: GraphQLSchema) => RuleSetRule
  eslintRequired: () => RuleSetRule
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
  virtualModules: PluginFactory
  eslint: PluginFactory
  eslintRequired: PluginFactory
}

/**
 * webpack atoms namespace
 */
interface IWebpackUtils {
  loaders: ILoaderUtils

  rules: IRuleUtils

  plugins: PluginUtils
}

const vendorRegex = /(node_modules|bower_components)/

/**
 * A factory method that produces an atoms namespace
 */
export const createWebpackUtils = (
  stage: Stage,
  program: IProgram
): IWebpackUtils => {
  const assetRelativeRoot = `static/`
  const supportedBrowsers = getBrowsersList(program.directory)

  const PRODUCTION = !stage.includes(`develop`)

  const isSSR = stage.includes(`html`)
  const { config } = store.getState()
  const { assetPrefix, pathPrefix } = config

  const publicPath = getPublicPath({ assetPrefix, pathPrefix, ...program })

  const makeExternalOnly =
    (original: RuleFactory) =>
    (options = {}): RuleSetRule => {
      const rule = original(options)
      rule.include = vendorRegex
      return rule
    }

  const makeInternalOnly =
    (original: RuleFactory) =>
    (options = {}): RuleSetRule => {
      const rule = original(options)
      rule.exclude = vendorRegex
      return rule
    }

  const fileLoaderCommonOptions: {
    name: string
    publicPath?: string
    outputPath?: string
  } = {
    name: `${assetRelativeRoot}[name]-[hash].[ext]`,
  }

  if (stage === `build-html` || stage === `develop-html`) {
    // build-html and develop-html outputs to `.cache/page-ssr/routes/` (ROUTES_DIRECTORY)
    // so this config is setting it to output assets to `public` (outputPath)
    // while preserving "url" (publicPath)
    fileLoaderCommonOptions.outputPath = path.relative(
      ROUTES_DIRECTORY,
      `public`
    )
    fileLoaderCommonOptions.publicPath = publicPath || `/`
  }

  const loaders: ILoaderUtils = {
    json: (options = {}) => {
      return {
        options,
        loader: require.resolve(`json-loader`),
      }
    },
    yaml: (options = {}) => {
      return {
        loader: require.resolve(`yaml-loader`),
        options: {
          asJSON: true,
          ...options,
        },
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

    // TODO(v5): Re-Apply https://github.com/gatsbyjs/gatsby/pull/33979 with breaking change in inline loader syntax
    miniCssExtract: (
      options: {
        modules?: MiniCSSExtractLoaderModuleOptions
      } = {}
    ) => {
      let moduleOptions: MiniCSSExtractLoaderModuleOptions = undefined

      const { modules, ...restOptions } = options

      if (typeof modules === `boolean` && options.modules) {
        moduleOptions = {
          namedExport: true,
        }
      } else {
        moduleOptions = modules
      }

      return {
        loader: MiniCssExtractPlugin.loader,
        options: {
          modules: moduleOptions,
          ...restOptions,
        },
      }
    },

    css: (options = {}) => {
      let modulesOptions: CSSModulesOptions = false
      if (options.modules) {
        modulesOptions = {
          auto: undefined,
          namedExport: true,
          localIdentName: `[name]--[local]--[hash:hex:5]`,
          exportLocalsConvention: `dashesOnly`,
          exportOnlyLocals: isSSR,
        }

        if (typeof options.modules === `object`) {
          modulesOptions = {
            ...modulesOptions,
            ...options.modules,
          }
        }
      }

      return {
        loader: require.resolve(`css-loader`),
        options: {
          // Absolute urls (https or //) are not send to this function. Only resolvable paths absolute or relative ones.
          url: function (url: string): boolean {
            // When an url starts with /
            if (url.startsWith(`/`)) {
              return false
            }

            return true
          },
          sourceMap: !PRODUCTION,
          modules: modulesOptions,
        },
      }
    },

    postcss: (options = {}) => {
      const {
        plugins,
        overrideBrowserslist = supportedBrowsers,
        ...postcssOpts
      } = options

      return {
        loader: require.resolve(`postcss-loader`),
        options: {
          execute: false,
          sourceMap: !PRODUCTION,
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          postcssOptions: (loaderContext: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let postCSSPlugins: Array<PostCSSPlugin> = []
            if (plugins) {
              postCSSPlugins =
                typeof plugins === `function` ? plugins(loaderContext) : plugins
            }

            const autoprefixerPlugin = autoprefixer({
              overrideBrowserslist,
              flexbox: `no-2009`,
              ...((
                postCSSPlugins.find(
                  plugin => plugin.postcssPlugin === `autoprefixer`
                ) as unknown as autoprefixer.ExportedAPI
              )?.options ?? {}),
            })

            postCSSPlugins.unshift(autoprefixerPlugin)
            postCSSPlugins.unshift(flexbugs)

            return {
              plugins: postCSSPlugins,
              ...postcssOpts,
            }
          },
        },
      }
    },

    file: (options = {}) => {
      return {
        loader: require.resolve(`file-loader`),
        options: {
          ...fileLoaderCommonOptions,
          ...options,
        },
      }
    },

    url: (options = {}) => {
      return {
        loader: require.resolve(`url-loader`),
        options: {
          limit: 10000,
          ...fileLoaderCommonOptions,
          fallback: require.resolve(`file-loader`),
          ...options,
        },
      }
    },

    js: options => {
      return {
        options: {
          stage,
          reactRuntime: config.jsxRuntime,
          reactImportSource: config.jsxImportSource,
          cacheDirectory: path.join(
            program.directory,
            `.cache`,
            `webpack`,
            `babel`
          ),
          ...options,
          rootDir: program.directory,
        },
        loader: require.resolve(`./babel-loader`),
      }
    },

    dependencies: options => {
      return {
        options: {
          cacheDirectory: path.join(
            program.directory,
            `.cache`,
            `webpack`,
            `babel`
          ),
          ...options,
        },
        loader: require.resolve(`babel-loader`),
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
    }: {
      modulesThatUseGatsby?: Array<IModuleThatUseGatsby>
    } = {}): RuleSetRule => {
      return {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
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
        use: ({ resourceQuery, issuer }): Array<RuleSetUseItem> => [
          // If a JS import comes from async-requires, assume it is for a page component.
          // Using `issuer` allows us to avoid mutating async-requires for this case.
          //
          // If other imports are added to async-requires in the future, another option is to
          // append a query param to page components in the store and check against `resourceQuery` here.
          //
          // This would require we adjust `doesModuleMatchResourcePath` in `static-query-mapper`
          // to check against the module's `resourceResolveData.path` instead of resource to avoid
          // mismatches because of the added query param. Other adjustments may also be needed.
          loaders.js({
            ...options,
            configFile: true,
            compact: PRODUCTION,
            isPageTemplate: /async-requires/.test(issuer),
            resourceQuery,
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
      modulesThatUseGatsby?: Array<IModuleThatUseGatsby>
    } = {}): RuleSetRule => {
      const jsOptions = {
        babelrc: false,
        configFile: false,
        compact: false,
        presets: [
          [
            require.resolve(`babel-preset-gatsby/dependencies`),
            {
              stage,
            },
          ],
        ],
        // If an error happens in a package, it's possible to be
        // because it was compiled. Thus, we don't want the browser
        // debugger to show the original code. Instead, the code
        // being evaluated would be much more helpful.
        sourceMaps: false,

        cacheIdentifier: JSON.stringify({
          browsersList: supportedBrowsers,
          gatsbyPreset: require(`babel-preset-gatsby/package.json`).version,
        }),
      }

      // TODO REMOVE IN V3
      // a list of vendors we know we shouldn't polyfill (we should have set core-js to entry but we didn't so we have to do this)
      const VENDORS_TO_NOT_POLYFILL = [
        `@babel[\\\\/]runtime`,
        `@mikaelkristiansson[\\\\/]domready`,
        `@reach[\\\\/]router`,
        `babel-preset-gatsby`,
        `core-js`,
        `dom-helpers`,
        `gatsby-legacy-polyfills`,
        `gatsby-link`,
        `gatsby-script`,
        `gatsby-react-router-scroll`,
        `invariant`,
        `lodash`,
        `mitt`,
        `prop-types`,
        `react-dom`,
        `react`,
        `regenerator-runtime`,
        `scheduler`,
        `scroll-behavior`,
        `shallow-compare`,
        `warning`,
        `webpack`,
      ]
      const doNotPolyfillRegex = new RegExp(
        `[\\\\/]node_modules[\\\\/](${VENDORS_TO_NOT_POLYFILL.join(
          `|`
        )})[\\\\/]`
      )

      return {
        test: /\.(js|mjs)$/,
        exclude: (modulePath: string): boolean => {
          // If dep is user land code, exclude
          if (!vendorRegex.test(modulePath)) {
            return true
          }

          // If dep uses Gatsby, exclude
          if (
            modulesThatUseGatsby.some(module =>
              modulePath.includes(module.path)
            )
          ) {
            return true
          }

          return doNotPolyfillRegex.test(modulePath)
        },
        type: `javascript/auto`,
        use: [loaders.dependencies(jsOptions)],
      }
    }
    rules.dependencies = dependencies
  }

  rules.yaml = (): RuleSetRule => {
    return {
      test: /\.ya?ml$/,
      type: `json`,
      use: [loaders.yaml()],
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
      test: /\.(ico|svg|jpg|jpeg|png|gif|webp|avif)(\?.*)?$/,
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
        !isSSR && loaders.miniCssExtract(restOptions),
        loaders.css({ ...restOptions, importLoaders: 1 }),
        loaders.postcss({ browsers }),
      ].filter(Boolean) as RuleSetRule["use"]

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

  plugins.minifyJs = ({
    terserOptions,
    ...options
  }: {
    terserOptions?: TerserOptions
  } = {}): WebpackPluginInstance =>
    new TerserPlugin({
      exclude: /\.min\.js/,
      terserOptions: {
        ie8: false,
        mangle: {
          safari10: true,
        },
        parse: {
          ecma: 5,
        },
        compress: {
          ecma: 5,
        },
        output: {
          ecma: 5,
        },
        ...terserOptions,
      },
      parallel: Math.max(1, cpuCoreCount() - 1),
      ...options,
    })

  plugins.minifyCss = (
    options = {
      minimizerOptions: {
        preset: [
          `default`,
          {
            svgo: {
              full: true,
              plugins: [
                // potentially destructive plugins removed - see https://github.com/gatsbyjs/gatsby/issues/15629
                // use correct config format and remove plugins requiring specific params - see https://github.com/gatsbyjs/gatsby/issues/31619
                // List of default plugins and their defaults: https://github.com/svg/svgo#built-in-plugins
                // Last update 2021-08-17
                `cleanupAttrs`,
                `cleanupEnableBackground`,
                `cleanupIDs`,
                `cleanupListOfValues`, // Default: disabled
                `cleanupNumericValues`,
                `collapseGroups`,
                `convertColors`,
                `convertPathData`,
                `convertStyleToAttrs`, // Default: disabled
                `convertTransform`,
                `inlineStyles`,
                `mergePaths`,
                `minifyStyles`,
                `moveElemsAttrsToGroup`,
                `moveGroupAttrsToElems`,
                `prefixIds`, // Default: disabled
                `removeComments`,
                `removeDesc`,
                `removeDoctype`,
                `removeEditorsNSData`,
                `removeEmptyAttrs`,
                `removeEmptyContainers`,
                `removeEmptyText`,
                `removeHiddenElems`,
                `removeMetadata`,
                `removeNonInheritableGroupAttrs`,
                `removeRasterImages`, // Default: disabled
                `removeScriptElement`, // Default: disabled
                `removeStyleElement`, // Default: disabled
                `removeTitle`,
                `removeUnknownsAndDefaults`,
                `removeUnusedNS`,
                `removeUselessDefs`,
                `removeUselessStrokeAndFill`,
                `removeXMLProcInst`,
                `reusePaths`, // Default: disabled
                `sortAttrs`, // Default: disabled
              ],
            },
          },
        ],
      },
    }
  ): CssMinimizerPlugin =>
    new CssMinimizerPlugin({
      parallel: Math.max(1, cpuCoreCount() - 1),
      ...options,
    })

  plugins.fastRefresh = ({ modulesThatUseGatsby }): WebpackPluginInstance => {
    const regExpToHack = /node_modules/
    regExpToHack.test = (modulePath: string): boolean => {
      // when it's not coming from node_modules we treat it as a source file.
      if (!vendorRegex.test(modulePath)) {
        return false
      }

      // If the module uses Gatsby as a dependency
      // we want to treat it as src because of shadowing
      return !modulesThatUseGatsby.some(module =>
        modulePath.includes(module.path)
      )
    }

    return new ReactRefreshWebpackPlugin({
      overlay: {
        sockIntegration: `whm`,
        module: path.join(__dirname, `fast-refresh-module`),
      },
      // this is a bit hacky - exclude expect string or regexp or array of those
      // so this is tricking ReactRefreshWebpackPlugin with providing regexp with
      // overwritten .test method
      exclude: regExpToHack,
    })
  }

  plugins.extractText = (options: any): WebpackPluginInstance =>
    new MiniCssExtractPlugin({
      ...options,
    })

  plugins.moment = (): WebpackPluginInstance =>
    plugins.ignore({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ })

  plugins.extractStats = (): GatsbyWebpackStatsExtractor =>
    new GatsbyWebpackStatsExtractor(publicPath)

  // TODO: remove this in v5
  plugins.eslintGraphqlSchemaReload = (): null => null

  plugins.virtualModules = (): GatsbyWebpackVirtualModules =>
    new GatsbyWebpackVirtualModules()

  plugins.eslint = (): WebpackPluginInstance => {
    const options = {
      extensions: [`js`, `jsx`],
      exclude: [
        `/node_modules/`,
        `/bower_components/`,
        VIRTUAL_MODULES_BASE_PATH,
      ],
      ...eslintConfig(config.jsxRuntime === `automatic`),
    }
    // @ts-ignore
    return new ESLintPlugin(options)
  }

  plugins.eslintRequired = (): WebpackPluginInstance => {
    const options = {
      extensions: [`js`, `jsx`],
      exclude: [
        `/node_modules/`,
        `/bower_components/`,
        VIRTUAL_MODULES_BASE_PATH,
      ],
      ...eslintRequiredConfig,
    }
    // @ts-ignore
    return new ESLintPlugin(options)
  }

  return {
    loaders,
    rules,
    plugins,
  }
}
