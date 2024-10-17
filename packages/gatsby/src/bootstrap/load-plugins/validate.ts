import _ from "lodash"
import path from "path"
import * as semver from "semver"
import * as stringSimilarity from "string-similarity"
import { version as gatsbyVersion } from "gatsby/package.json"
import reporter from "gatsby-cli/lib/reporter"
import { validateOptionsSchema, Joi } from "gatsby-plugin-utils"
import { IPluginRefObject } from "gatsby-plugin-utils/dist/types"
import { stripIndent } from "common-tags"
import { isWorker } from "gatsby-worker"
import { resolveModuleExports } from "../resolve-module-exports"
import { getLatestAPIs } from "../../utils/get-latest-gatsby-files"
import { GatsbyNode, PackageJson } from "../../../"
import {
  IPluginInfo,
  IFlattenedPlugin,
  IPluginInfoOptions,
  ISiteConfig,
} from "./types"
import { resolvePlugin } from "./resolve-plugin"
import { preferDefault } from "../prefer-default"
import { importGatsbyPlugin } from "../../utils/import-gatsby-plugin"
import { maybeAddFileProtocol } from "../resolve-js-file-path"

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
  [exportType in ExportType]: Array<IEntry>
}

export type ICurrentAPIs = {
  [exportType in ExportType]: Array<string>
}

const getGatsbyUpgradeVersion = (entries: ReadonlyArray<IEntry>): string =>
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
  pluginAPIKeys: ReadonlyArray<string>,
  apis: ReadonlyArray<string>
): Array<IEntry> {
  let badExports: Array<IEntry> = []
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
  badExports: Array<IEntry>,
  exportType: ExportType,
  currentAPIs: ICurrentAPIs,
  latestAPIs: { [exportType in ExportType]: { [exportName: string]: IApi } }
): {
  errors: Array<string>
  entries: Array<IEntry>
  exportType: ExportType
  fixes: Array<string>
  sourceMessage: string
} {
  const entries = badExports.map(ex => {
    return {
      ...ex,
      api: latestAPIs[exportType][ex.exportName],
    }
  })

  const gatsbyUpgradeVersion = getGatsbyUpgradeVersion(entries)
  const errors: Array<string> = []
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
  badExports: { [api in ExportType]: Array<IEntry> }
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

const addModuleImportAndValidateOptions =
  (rootDir: string, incErrors: (inc: number) => void) =>
  async (value: Array<IPluginRefObject>): Promise<Array<IPluginRefObject>> => {
    for (const plugin of value) {
      if (plugin.modulePath) {
        const importedModule = await import(
          maybeAddFileProtocol(plugin.modulePath)
        )
        const pluginModule = preferDefault(importedModule)
        plugin.module = pluginModule
      }
    }

    const { errors: subErrors, plugins: subPlugins } =
      await validatePluginsOptions(value as Array<IPluginRefObject>, rootDir)

    incErrors(subErrors)
    return subPlugins
  }

async function validatePluginsOptions(
  plugins: Array<IPluginRefObject>,
  rootDir: string
): Promise<{
  errors: number
  plugins: Array<IPluginRefObject>
}> {
  let errors = 0
  const newPlugins = await Promise.all(
    plugins.map(async plugin => {
      let gatsbyNode
      try {
        const resolvedPlugin = resolvePlugin(plugin, rootDir)
        gatsbyNode = await importGatsbyPlugin(resolvedPlugin, `gatsby-node`)
      } catch (err) {
        gatsbyNode = {}
      }

      if (!gatsbyNode.pluginOptionsSchema) return plugin

      const subPluginPaths = new Set<string>()

      let optionsSchema = (
        gatsbyNode.pluginOptionsSchema as Exclude<
          GatsbyNode["pluginOptionsSchema"],
          undefined
        >
      )({
        Joi: Joi.extend(joi => {
          return {
            type: `subPlugins`,
            base: joi
              .array()
              .items(
                joi.alternatives(
                  joi.string(),
                  joi.object({
                    resolve: Joi.string(),
                    options: Joi.object({}).unknown(true),
                  })
                )
              )
              .custom((arrayValue, helpers) => {
                const entry = helpers.schema._flags.entry
                return arrayValue.map(value => {
                  if (typeof value === `string`) {
                    value = { resolve: value }
                  }

                  try {
                    const resolvedPlugin = resolvePlugin(value, rootDir)
                    const modulePath = require.resolve(
                      `${resolvedPlugin.resolve}${entry ? `/${entry}` : ``}`
                    )
                    value.modulePath = modulePath

                    const normalizedPath = helpers.state.path
                      .map((key, index) => {
                        // if subplugin is part of an array - swap concrete index key with `[]`
                        if (
                          typeof key === `number` &&
                          Array.isArray(
                            helpers.state.ancestors[
                              helpers.state.path.length - index - 1
                            ]
                          )
                        ) {
                          if (index !== helpers.state.path.length - 1) {
                            throw new Error(
                              `No support for arrays not at the end of path`
                            )
                          }
                          return `[]`
                        }

                        return key
                      })
                      .join(`.`)

                    subPluginPaths.add(normalizedPath)
                  } catch (err) {
                    console.log(err)
                  }

                  return value
                })
              }, `Gatsby specific subplugin validation`)
              .default([])
              .external(
                addModuleImportAndValidateOptions(
                  rootDir,
                  (inc: number): void => {
                    errors += inc
                  }
                ),
                `add module key to subplugin`
              ),
            args: (schema: any, args: any): any => {
              if (
                args?.entry &&
                schema &&
                typeof schema === `object` &&
                schema.$_setFlag
              ) {
                return schema.$_setFlag(`entry`, args.entry, { clone: true })
              }
              return schema
            },
          }
        }),
      })

      // If rootDir and plugin.parentDir are the same, i.e. if this is a plugin a user configured in their gatsby-config.js (and not a sub-theme that added it), this will be ""
      // Otherwise, this will contain (and show) the relative path
      const configDir =
        (plugin.parentDir &&
          rootDir &&
          path.relative(rootDir, plugin.parentDir)) ||
        null

      if (!Joi.isSchema(optionsSchema) || optionsSchema.type !== `object`) {
        // Validate correct usage of pluginOptionsSchema
        reporter.warn(
          `Plugin "${plugin.resolve}" has an invalid options schema so we cannot verify your configuration for it.`
        )
        return plugin
      }

      try {
        if (!optionsSchema.describe().keys.plugins) {
          // All plugins have "plugins: []"" added to their options in load.ts, even if they
          // do not have subplugins. We add plugins to the schema if it does not exist already
          // to make sure they pass validation.
          optionsSchema = optionsSchema.append({
            plugins: Joi.array().length(0),
          })
        }

        const { value, warning } = await validateOptionsSchema(
          optionsSchema,
          (plugin.options as IPluginInfoOptions) || {}
        )

        plugin.options = value

        // Handle unknown key warnings
        const validationWarnings = warning?.details

        if (validationWarnings?.length > 0) {
          reporter.warn(
            stripIndent(`
        Warning: there are unknown plugin options for "${plugin.resolve}"${
              configDir ? `, configured by ${configDir}` : ``
            }: ${validationWarnings
              .map(error => error.path.join(`.`))
              .join(`, `)}
        Please open an issue at https://ghub.io/${
          plugin.resolve
        } if you believe this option is valid.
      `)
          )
          // We do not increment errors++ here as we do not want to process.exit if there are only warnings
        }

        // Validate subplugins if they weren't handled already
        if (!subPluginPaths.has(`plugins`) && plugin.options?.plugins) {
          const { errors: subErrors, plugins: subPlugins } =
            await validatePluginsOptions(
              plugin.options.plugins as Array<IPluginRefObject>,
              rootDir
            )
          plugin.options.plugins = subPlugins
          if (subPlugins.length > 0) {
            subPluginPaths.add(`plugins`)
          }
          errors += subErrors
        }
        if (subPluginPaths.size > 0) {
          plugin.subPluginPaths = Array.from(subPluginPaths)
        }
      } catch (error) {
        if (error instanceof Joi.ValidationError) {
          const validationErrors = error.details
          if (validationErrors.length > 0) {
            reporter.error({
              id: `11331`,
              context: {
                configDir,
                validationErrors,
                pluginName: plugin.resolve,
              },
            })
            errors++
          }
          return plugin
        }

        throw error
      }

      return plugin
    })
  )
  return { errors, plugins: newPlugins }
}

export async function validateConfigPluginsOptions(
  config: ISiteConfig = {},
  rootDir: string
): Promise<void> {
  if (!config.plugins) return

  const { errors, plugins } = await validatePluginsOptions(
    config.plugins,
    rootDir
  )

  config.plugins = plugins

  if (errors > 0) {
    process.exit(1)
  }
}

/**
 * Identify which APIs each plugin exports
 */
export async function collatePluginAPIs({
  currentAPIs,
  flattenedPlugins,
  rootDir,
}: {
  currentAPIs: ICurrentAPIs
  flattenedPlugins: Array<IPluginInfo & Partial<IFlattenedPlugin>>
  rootDir: string
}): Promise<{
  flattenedPlugins: Array<IFlattenedPlugin>
  badExports: IEntryMap
}> {
  // Get a list of bad exports
  const badExports: IEntryMap = {
    node: [],
    browser: [],
    ssr: [],
  }

  for (const plugin of flattenedPlugins) {
    plugin.nodeAPIs = []
    plugin.browserAPIs = []
    plugin.ssrAPIs = []

    // Discover which APIs this plugin implements and store an array against
    // the plugin node itself *and* in an API to plugins map for faster lookups
    // later.
    const pluginNodeExports = await resolveModuleExports(
      plugin.resolvedCompiledGatsbyNode ?? `${plugin.resolve}/gatsby-node`,
      {
        mode: `import`,
        rootDir,
      }
    )
    const pluginBrowserExports = await resolveModuleExports(
      `${plugin.resolve}/gatsby-browser`,
      {
        rootDir,
      }
    )
    const pluginSSRExports = await resolveModuleExports(
      `${plugin.resolve}/gatsby-ssr`,
      { rootDir }
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
  }

  return {
    flattenedPlugins: flattenedPlugins as Array<IFlattenedPlugin>,
    badExports,
  }
}

export const handleMultipleReplaceRenderers = ({
  flattenedPlugins,
}: {
  flattenedPlugins: Array<IFlattenedPlugin>
}): Array<IFlattenedPlugin> => {
  // multiple replaceRenderers may cause problems at build time
  const rendererPlugins = flattenedPlugins
    .filter(plugin => plugin.ssrAPIs.includes(`replaceRenderer`))
    .map(plugin => plugin.name)
  if (rendererPlugins.length > 1) {
    if (rendererPlugins.includes(`default-site-plugin`)) {
      reporter.warn(`replaceRenderer API found in these plugins:`)
      reporter.warn(rendererPlugins.join(`, `))
      reporter.warn(
        `This might be an error, see: https://www.gatsbyjs.com/docs/debugging-replace-renderer-api/`
      )
    } else {
      console.log(``)
      reporter.error(
        `Gatsby's replaceRenderer API is implemented by multiple plugins:`
      )
      reporter.error(rendererPlugins.join(`, `))
      reporter.error(`This will break your build`)
      reporter.error(
        `See: https://www.gatsbyjs.com/docs/debugging-replace-renderer-api/`
      )
      if (process.env.NODE_ENV === `production`) process.exit(1)
    }

    // Now update plugin list so only final replaceRenderer will run
    const ignorable = rendererPlugins.slice(0, -1)

    // For each plugin in ignorable, set a skipSSR flag to true
    // This prevents apiRunnerSSR() from attempting to run it later
    const messages: Array<string> = []
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
  packageJSON: PackageJson
): void {
  // Note: In the future the peer dependency should be enforced for all plugins.
  const gatsbyPeerDependency = _.get(packageJSON, `peerDependencies.gatsby`)
  if (
    !isWorker &&
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
