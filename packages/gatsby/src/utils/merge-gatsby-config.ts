import _ from "lodash"
import { Express } from "express"
import type { TrailingSlash } from "gatsby-page-utils"

export interface IPluginEntryWithParentDir {
  resolve: string
  options?: Record<string, unknown>
  parentDir: string
}
// TODO export it in index.d.ts
export type PluginEntry = string | IPluginEntryWithParentDir

export interface IGatsbyConfigInput {
  siteMetadata?: Record<string, unknown>
  plugins?: Array<PluginEntry>
  pathPrefix?: string
  assetPrefix?: string
  polyfill?: boolean
  mapping?: Record<string, string>
  proxy?: {
    prefix: string
    url: string
  }
  developMiddleware?(app: Express): void
  jsxRuntime?: "classic" | "automatic"
  jsxImportSource?: string
  trailingSlash?: TrailingSlash
}

type ConfigKey = keyof IGatsbyConfigInput
type Metadata = IGatsbyConfigInput["siteMetadata"]
type Mapping = IGatsbyConfigInput["mapping"]

const howToMerge = {
  /**
   * pick a truthy value by default.
   * This makes sure that if a single value is defined, that one it used.
   * We prefer the "right" value, because the user's config will be "on the right"
   */
  byDefault: (a: ConfigKey, b: ConfigKey): ConfigKey => b || a,
  siteMetadata: (objA: Metadata, objB: Metadata): Metadata =>
    _.merge({}, objA, objB),
  // plugins are concatenated and uniq'd, so we don't get two of the same plugin value
  plugins: (
    a: Array<PluginEntry> = [],
    b: Array<PluginEntry> = []
  ): Array<PluginEntry> => a.concat(b),
  mapping: (objA: Mapping, objB: Mapping): Mapping => _.merge({}, objA, objB),
} as const

/**
 * Defines how a theme object is merged with the user's config
 */
export const mergeGatsbyConfig = (
  a: IGatsbyConfigInput,
  b: IGatsbyConfigInput
): IGatsbyConfigInput => {
  // a and b are gatsby configs, If they have keys, that means there are values to merge
  const allGatsbyConfigKeysWithAValue = _.uniq(
    Object.keys(a).concat(Object.keys(b))
  ) as Array<ConfigKey>

  // reduce the array of mergable keys into a single gatsby config object
  const mergedConfig = allGatsbyConfigKeysWithAValue.reduce(
    (config, gatsbyConfigKey) => {
      // choose a merge function for the config key if there's one defined,
      // otherwise use the default value merge function
      const mergeFn = howToMerge[gatsbyConfigKey] || howToMerge.byDefault
      return {
        ...config,
        [gatsbyConfigKey]: mergeFn(a[gatsbyConfigKey], b[gatsbyConfigKey]),
      }
    },
    {} as IGatsbyConfigInput
  )

  // return the fully merged config
  return mergedConfig
}
