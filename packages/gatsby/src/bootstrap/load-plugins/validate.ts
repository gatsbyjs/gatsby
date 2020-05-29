import _ from "lodash"
import * as semver from "semver"
import * as stringSimilarity from "string-similarity"
import { version as gatsbyVersion } from "gatsby/package.json"
import reporter from "gatsby-cli/lib/reporter"
import { resolveModuleExports } from "../resolve-module-exports"
import { getLatestAPIs } from "../../utils/get-latest-apis"
import { IPluginInfo, IFlattenedPlugin } from "./types"

interface IApi {
  version?: string
}

export interface IEntry {
  exportName: string
  pluginName: string
  pluginVersion: string
  api?: IApi
}

export type ExportType = "node" | "browser" | "ssr"

type IEntryMap = {
  [exportType in ExportType]: IEntry[]
}

export type ICurrentAPIs = {
  [exportType in ExportType]: string[]
}

const getGatsbyUpgradeVersion = (entries: readonly IEntry[]): string =>
  entries.reduce((version, entry) => {
    if (entry.api && entry.api.version) {
      return semver.gt(entry.api.version, version || `0.0.0`)
        ? entry.api.version
        : version
    }
    return version
  }, ``)

// Given a plugin object, an array of the API names it exports and an
// array of valid API names, return an array of invalid API exports.
function getBadExports(
  plugin: IPluginInfo,
  pluginAPIKeys: readonly string[],
  apis: readonly string[]
): IEntry[] {
  let badExports: IEntry[] = []
  // Discover any exports from plugins which are not "known"
  badExports = badExports.concat(
    _.difference(pluginAPIKeys, apis).map(e => {
      return {
        exportName: e,
        pluginName: plugin.name,
        pluginVersion: plugin.version,
      }
    })
  )
  return badExports
}

function getErrorContext(
  badExports: IEntry[],
  exportType: ExportType,
  currentAPIs: ICurrentAPIs,
  latestAPIs: { [exportType in ExportType]: { [exportName: string]: IApi } }
): {
  errors: string[]
  entries: IEntry[]
  exportType: ExportType
  fixes: string[]
  sourceMessage: string
} {
  const entries = badExports.map(ex => {
    return {
      ...ex,
      api: latestAPIs[exportType][ex.exportName],
    }
  })

  const gatsbyUpgradeVersion = getGatsbyUpgradeVersion(entries)
  const errors: string[] = []
  const fixes = gatsbyUpgradeVersion
    ? [`npm install gatsby@^${gatsbyUpgradeVersion}`]
    : []

  entries.forEach(entry => {
    const similarities = stringSimilarity.findBestMatch(
      entry.exportName,
      currentAPIs[exportType]
    )
    const isDefaultPlugin = entry.pluginName == `default-site-plugin`

    const message = entry.api
      ? entry.api.version
        ? `was introduced in gatsby@${entry.api.version}`
        : `is not available in your version of Gatsby`
      : `is not a known API`

    if (isDefaultPlugin) {
      errors.push(
        `- Your local gatsby-${exportType}.js is using the API "${entry.exportName}" which ${message}.`
      )
    } else {
      errors.push(
        `- The plugin ${entry.pluginName}@${entry.pluginVersion} is using the API "${entry.exportName}" which ${message}.`
      )
    }

    if (similarities.bestMatch.rating > 0.5) {
      fixes.push(
        `Rename "${entry.exportName}" -> "${similarities.bestMatch.target}"`
      )
    }
  })

  return {
    errors,
    entries,
    exportType,
    fixes,
    // note: this is a fallback if gatsby-cli is not updated with structured error
    sourceMessage: [
      `Your plugins must export known APIs from their gatsby-node.js.`,
    ]
      .concat(errors)
      .concat(
        fixes.length > 0
          ? [`\n`, `Some of the following may help fix the error(s):`, ...fixes]
          : []
      )
      .filter(Boolean)
      .join(`\n`),
  }
}

export async function handleBadExports({
  currentAPIs,
  badExports,
}: {
  currentAPIs: ICurrentAPIs
  badExports: { [api in ExportType]: IEntry[] }
}): Promise<void> {
  const hasBadExports = Object.keys(badExports).find(
    api => badExports[api].length > 0
  )
  if (hasBadExports) {
    const latestAPIs = await getLatestAPIs()
    // Output error messages for all bad exports
    _.toPairs(badExports).forEach(badItem => {
      const [exportType, entries] = badItem
      if (entries.length > 0) {
        const context = getErrorContext(
          entries,
          exportType as keyof typeof badExports,
          currentAPIs,
          latestAPIs
        )
        reporter.error({
          id: `11329`,
          context,
        })
      }
    })
  }
}

/**
 * Identify which APIs each plugin exports
 */
export function collatePluginAPIs({
  currentAPIs,
  flattenedPlugins,
}: {
  currentAPIs: ICurrentAPIs
  flattenedPlugins: (IPluginInfo & Partial<IFlattenedPlugin>)[]
}): { flattenedPlugins: IFlattenedPlugin[]; badExports: IEntryMap } {
  // Get a list of bad exports
  const badExports: IEntryMap = {
    node: [],
    browser: [],
    ssr: [],
  }

  flattenedPlugins.forEach(plugin => {
    plugin.nodeAPIs = []
    plugin.browserAPIs = []
    plugin.ssrAPIs = []

    // Discover which APIs this plugin implements and store an array against
    // the plugin node itself *and* in an API to plugins map for faster lookups
    // later.
    const pluginNodeExports = resolveModuleExports(
      `${plugin.resolve}/gatsby-node`,
      {
        mode: `require`,
      }
    )
    const pluginBrowserExports = resolveModuleExports(
      `${plugin.resolve}/gatsby-browser`
    )
    const pluginSSRExports = resolveModuleExports(
      `${plugin.resolve}/gatsby-ssr`
    )

    if (pluginNodeExports.length > 0) {
      plugin.nodeAPIs = _.intersection(pluginNodeExports, currentAPIs.node)
      badExports.node = badExports.node.concat(
        getBadExports(plugin, pluginNodeExports, currentAPIs.node)
      ) // Collate any bad exports
    }

    if (pluginBrowserExports.length > 0) {
      plugin.browserAPIs = _.intersection(
        pluginBrowserExports,
        currentAPIs.browser
      )
      badExports.browser = badExports.browser.concat(
        getBadExports(plugin, pluginBrowserExports, currentAPIs.browser)
      ) // Collate any bad exports
    }

    if (pluginSSRExports.length > 0) {
      plugin.ssrAPIs = _.intersection(pluginSSRExports, currentAPIs.ssr)
      badExports.ssr = badExports.ssr.concat(
        getBadExports(plugin, pluginSSRExports, currentAPIs.ssr)
      ) // Collate any bad exports
    }
  })

  return {
    flattenedPlugins: flattenedPlugins as IFlattenedPlugin[],
    badExports,
  }
}

export const handleMultipleReplaceRenderers = ({
  flattenedPlugins,
}: {
  flattenedPlugins: IFlattenedPlugin[]
}): IFlattenedPlugin[] => {
  // multiple replaceRenderers may cause problems at build time
  const rendererPlugins = flattenedPlugins
    .filter(plugin => plugin.ssrAPIs.includes(`replaceRenderer`))
    .map(plugin => plugin.name)
  if (rendererPlugins.length > 1) {
    if (rendererPlugins.includes(`default-site-plugin`)) {
      reporter.warn(`replaceRenderer API found in these plugins:`)
      reporter.warn(rendererPlugins.join(`, `))
      reporter.warn(
        `This might be an error, see: https://www.gatsbyjs.org/docs/debugging-replace-renderer-api/`
      )
    } else {
      console.log(``)
      reporter.error(
        `Gatsby's replaceRenderer API is implemented by multiple plugins:`
      )
      reporter.error(rendererPlugins.join(`, `))
      reporter.error(`This will break your build`)
      reporter.error(
        `See: https://www.gatsbyjs.org/docs/debugging-replace-renderer-api/`
      )
      if (process.env.NODE_ENV === `production`) process.exit(1)
    }

    // Now update plugin list so only final replaceRenderer will run
    const ignorable = rendererPlugins.slice(0, -1)

    // For each plugin in ignorable, set a skipSSR flag to true
    // This prevents apiRunnerSSR() from attempting to run it later
    const messages: string[] = []
    flattenedPlugins.forEach((fp, i) => {
      if (ignorable.includes(fp.name)) {
        messages.push(
          `Duplicate replaceRenderer found, skipping gatsby-ssr.js for plugin: ${fp.name}`
        )
        flattenedPlugins[i].skipSSR = true
      }
    })
    if (messages.length > 0) {
      console.log(``)
      messages.forEach(m => reporter.warn(m))
      console.log(``)
    }
  }

  return flattenedPlugins
}

export function warnOnIncompatiblePeerDependency(
  name: string,
  packageJSON: object
): void {
  // Note: In the future the peer dependency should be enforced for all plugins.
  const gatsbyPeerDependency = _.get(packageJSON, `peerDependencies.gatsby`)
  if (
    gatsbyPeerDependency &&
    !semver.satisfies(gatsbyVersion, gatsbyPeerDependency, {
      includePrerelease: true,
    })
  ) {
    reporter.warn(
      `Plugin ${name} is not compatible with your gatsby version ${gatsbyVersion} - It requires gatsby@${gatsbyPeerDependency}`
    )
  }
}
