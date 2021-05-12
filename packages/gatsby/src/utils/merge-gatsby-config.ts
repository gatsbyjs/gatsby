import _ from "lodash"
import { Express } from "express"
// TODO export it in index.d.ts
type PluginEntry =
  | string
  | {
      resolve: string
      options?: Record<string, unknown>
    }

interface INormalizedPluginEntry {
  resolve: string
  options: Record<string, unknown>
}

interface IGatsbyConfigInput {
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
}

type ConfigKey = keyof IGatsbyConfigInput
type Metadata = IGatsbyConfigInput["siteMetadata"]
type Mapping = IGatsbyConfigInput["mapping"]

/**
 * Normalize plugin spec before comparing so
 *  - `gatsby-plugin-name`
 *  - { resolve: `gatsby-plugin-name` }
 *  - { resolve: `gatsby-plugin-name`, options: {} }
 * are all considered equal
 */
const normalizePluginEntry = (entry: PluginEntry): INormalizedPluginEntry =>
  _.isString(entry)
    ? {
        resolve: entry,
        options: {},
      }
    : _.isObject(entry)
    ? { options: {}, ...entry }
    : entry

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
  ): Array<PluginEntry> =>
    _.uniqWith(a.concat(b), (a, b) =>
      _.isEqual(
        _.pick(normalizePluginEntry(a), [`resolve`, `options`]),
        _.pick(normalizePluginEntry(b), [`resolve`, `options`])
      )
    ),
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

  // reduce the array of mergeable keys into a single gatsby config object
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
