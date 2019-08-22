type LoaderSpec = string | { loader: string; options?: Object }
type LoaderResolver<T extends Object> = (options?: T) => LoaderSpec

type Condition = string | RegExp | RegExp[]

type Rule = {
  test?: Condition
  use: LoaderSpec[]
  exclude?: Condition
  include?: Condition
}

type RuleFactory<T extends Object> = (options?: T) => Rule

type ContextualRuleFactory = RuleFactory<any> & {
  internal: RuleFactory<any>
  external: RuleFactory<any>
}

type PluginInstance = any
type PluginFactory = (...args: any[]) => PluginInstance

type BuiltinPlugins = any

type Stage = "develop" | "develop-html" | "build-javascript" | "build-html"

/**
 * Configuration options for `createUtils`
 */
export type WebpackUtilsOptions = { stage: Stage; program: any }

/**
 * Utils that produce webpack `loader` objects
 */
export interface LoaderUtils {
  json: LoaderResolver<any>
  yaml: LoaderResolver<any>
  null: LoaderResolver<any>
  raw: LoaderResolver<any>

  style: LoaderResolver<any>
  css: LoaderResolver<any>
  postcss: LoaderResolver<{
    browsers?: string[]
    plugins?: Array<any> | ((loader: any) => Array<any>)
  }>

  file: LoaderResolver<any>
  url: LoaderResolver<any>
  js: LoaderResolver<any>
  dependencies: LoaderResolver<any>

  miniCssExtract: LoaderResolver<any>
  imports: LoaderResolver<any>
  exports: LoaderResolver<any>

  eslint: LoaderResolver<any>
}

/**
 * Utils that produce webpack rule objects
 */
export type RuleUtils = {
  /**
   * Handles JavaScript compilation via babel
   */
  js: RuleFactory<any>
  yaml: RuleFactory<any>
  fonts: RuleFactory<any>
  images: RuleFactory<any>
  miscAssets: RuleFactory<any>

  css: ContextualRuleFactory
  cssModules: RuleFactory<any>
  postcss: ContextualRuleFactory

  eslint: RuleFactory<any>
}

export type PluginUtils = BuiltinPlugins & {
  extractText: PluginFactory
  uglify: PluginFactory
  moment: PluginFactory
  extractStats: PluginFactory
}

/**
 * webpack atoms namespace
 */
export type WebpackUtils = {
  loaders: LoaderUtils

  rules: RuleUtils

  plugins: PluginUtils
}
